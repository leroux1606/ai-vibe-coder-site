import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { profile } from "../../../content/profile";
import {
  resolveDigitalTwinSession,
  setChatHistory,
  validateChatContinuation,
} from "../../../lib/chatSession";
import { parseChatPostBody } from "../../../lib/chatRequest";
import { connectionErrorDetail } from "../../../lib/connectionDetail";
import { buildDigitalTwinSystemPrompt } from "../../../lib/digitalTwinContext";
import type { ChatTurn } from "../../../lib/digitalTwinMessages";
import { sanitizeMessages } from "../../../lib/digitalTwinMessages";
import { wrapSseStreamWithSessionCommit } from "../../../lib/openRouterSseAccumulate";
import { checkRateLimit, clientIpFromRequest } from "../../../lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel / serverless only; ignored elsewhere */
export const maxDuration = 120;

const DEFAULT_MODEL = "openai/gpt-oss-20b";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const FETCH_TIMEOUT_MS = 120_000;
const RETRY_DELAY_MS_FIRST = 400;
const RETRY_DELAY_MS_SECOND = 1200;

function numEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function siteUrlForReferer(): string {
  return (
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000"
  );
}

function modelId(): string {
  const m = process.env.DIGITAL_TWIN_MODEL?.trim();
  return m || DEFAULT_MODEL;
}

async function fetchOpenRouter(
  payload: Record<string, unknown>,
  apiKey: string,
): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrlForReferer(),
        "X-Title": "Jan Le Roux - Digital Twin",
      },
      body: JSON.stringify(payload),
    });
  } finally {
    clearTimeout(t);
  }
}

function commitAssistantReply(
  sessionKey: string,
  serverHistory: ChatTurn[],
  userMsg: ChatTurn,
  assistantContent: string,
): void {
  const trimmed = assistantContent.trim();
  if (!trimmed) return;
  setChatHistory(sessionKey, [
    ...serverHistory,
    userMsg,
    { role: "assistant", content: trimmed },
  ]);
}

/** Avoid Next.js default HTML 405 pages for accidental GETs (helps debug proxies). */
export function GET() {
  return NextResponse.json(
    {
      error:
        'This URL only accepts POST with JSON body { "messages": [...] }. Open the portfolio site and use the chat UI.',
    },
    { status: 405, headers: { Allow: "POST, OPTIONS" } },
  );
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: "POST, OPTIONS" },
  });
}

export async function POST(request: NextRequest) {
  try {
    return await postDigitalTwinChat(request);
  } catch (err) {
    console.error("[digital-twin] Unhandled error:", err);
    return NextResponse.json(
      {
        error:
          "The chat service hit an unexpected error. Please refresh the page and try again.",
      },
      { status: 500 },
    );
  }
}

async function postDigitalTwinChat(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const ip = clientIpFromRequest(request);
  const rlMax = numEnv("DIGITAL_TWIN_RL_MAX", 30);
  const rlWindowMs = numEnv("DIGITAL_TWIN_RL_WINDOW_MS", 15 * 60 * 1000);
  const sessionMax = numEnv("DIGITAL_TWIN_RL_SESSION_MAX", 60);

  const ipLimit = checkRateLimit(`ip:${ip}`, rlMax, rlWindowMs);
  if (!ipLimit.ok) {
    return NextResponse.json(
      {
        error: `Too many requests. Try again in ${ipLimit.retryAfterSec} seconds.`,
        retryAfterSec: ipLimit.retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipLimit.retryAfterSec),
        },
      },
    );
  }

  const sessionId = request.cookies.get("dt_sid")?.value;
  if (sessionMax > 0 && sessionId) {
    const sidLimit = checkRateLimit(`sid:${sessionId}`, sessionMax, rlWindowMs);
    if (!sidLimit.ok) {
      return NextResponse.json(
        {
          error: `Too many requests from this session. Try again in ${sidLimit.retryAfterSec} seconds.`,
          retryAfterSec: sidLimit.retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(sidLimit.retryAfterSec),
          },
        },
      );
    }
  }

  const { sessionKey, history: serverHistory } = resolveDigitalTwinSession(
    sessionId,
    ip,
  );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseChatPostBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const history = sanitizeMessages(parsed.messagesRaw);
  if (!history) {
    return NextResponse.json(
      {
        error: "Provide a non-empty messages array with user/assistant roles.",
      },
      { status: 400 },
    );
  }

  const validated = validateChatContinuation(serverHistory, history);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const userMsg = validated.newUserMessage;
  const systemContent = buildDigitalTwinSystemPrompt(profile);
  const messagesForModel: {
    role: "system" | "user" | "assistant";
    content: string;
  }[] = [{ role: "system", content: systemContent }, ...serverHistory, userMsg];

  const payload = {
    model: modelId(),
    messages: messagesForModel,
    stream: true,
  };

  let res: Response;
  try {
    res = await fetchOpenRouter(payload, apiKey);
  } catch (first) {
    console.error("[digital-twin] OpenRouter fetch failed:", first);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS_FIRST));
    try {
      res = await fetchOpenRouter(payload, apiKey);
    } catch (second) {
      console.error("[digital-twin] OpenRouter retry failed:", second);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS_SECOND));
      try {
        res = await fetchOpenRouter(payload, apiKey);
      } catch (third) {
        console.error("[digital-twin] OpenRouter third attempt failed:", third);
        const detail = connectionErrorDetail(third);
        const hint =
          "Check internet/VPN/firewall. If you use a corporate proxy, set HTTPS_PROXY (and NO_PROXY for localhost) in .env and restart dev. On some networks, try: set NODE_OPTIONS=--dns-result-order=ipv4first before pnpm dev.";
        const isDev = process.env.NODE_ENV === "development";
        return NextResponse.json(
          {
            error: `Could not reach OpenRouter. ${hint}`,
            ...(isDev ? { detail } : {}),
          },
          { status: 502 },
        );
      }
    }
  }

  const ct = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      error?: { message?: string };
      message?: string;
    } | null;
    const msg =
      data?.error?.message ??
      data?.message ??
      `OpenRouter error (${res.status})`;
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  if (!res.body) {
    return NextResponse.json(
      { error: "Empty response body from model." },
      { status: 502 },
    );
  }

  if (!ct.includes("text/event-stream")) {
    const data = (await res.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
    } | null;
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 },
      );
    }
    const trimmed = text.trim();
    commitAssistantReply(sessionKey, serverHistory, userMsg, trimmed);
    return NextResponse.json({ message: trimmed });
  }

  const wrapped = wrapSseStreamWithSessionCommit(res.body, (assistantText) => {
    commitAssistantReply(sessionKey, serverHistory, userMsg, assistantText);
  });

  return new Response(wrapped, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
