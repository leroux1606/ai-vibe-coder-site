import { NextResponse } from "next/server";
import { profile } from "../../../content/profile";
import { buildDigitalTwinSystemPrompt } from "../../../lib/digitalTwinContext";

const MODEL = "openai/gpt-oss-20b";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_MESSAGES = 24;
const MAX_CONTENT_LENGTH = 8000;
const FETCH_TIMEOUT_MS = 120_000;

function connectionErrorDetail(err) {
  if (!err || typeof err !== "object") return String(err);
  const cause = err.cause;
  const fromCause =
    cause && typeof cause === "object" && "message" in cause
      ? String(cause.message)
      : "";
  const fromErr = "message" in err ? String(err.message) : "";
  return fromCause || fromErr || "Unknown network error";
}

async function fetchOpenRouter(payload, apiKey) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Jan Le Roux - Digital Twin",
      },
      body: JSON.stringify(payload),
    });
  } finally {
    clearTimeout(t);
  }
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = m.role;
    const content = m.content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.slice(0, MAX_CONTENT_LENGTH);
    if (!trimmed.trim()) continue;
    out.push({ role, content: trimmed });
    if (out.length >= MAX_MESSAGES) break;
  }
  return out.length ? out : null;
}

export async function POST(request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const history = sanitizeMessages(body?.messages);
  if (!history) {
    return NextResponse.json(
      { error: "Provide a non-empty messages array with user/assistant roles." },
      { status: 400 }
    );
  }

  const systemContent = buildDigitalTwinSystemPrompt(profile);
  const messages = [{ role: "system", content: systemContent }, ...history];

  const payload = { model: MODEL, messages };

  let res;
  try {
    res = await fetchOpenRouter(payload, apiKey);
  } catch (first) {
    console.error("[digital-twin] OpenRouter fetch failed:", first);
    await new Promise((r) => setTimeout(r, 400));
    try {
      res = await fetchOpenRouter(payload, apiKey);
    } catch (second) {
      console.error("[digital-twin] OpenRouter retry failed:", second);
      const detail = connectionErrorDetail(second);
      const hint =
        "Check internet/VPN/firewall. If you use a corporate proxy, set HTTPS_PROXY (and NO_PROXY for localhost) in .env and restart dev. On some networks, try: set NODE_OPTIONS=--dns-result-order=ipv4first before pnpm dev.";
      const isDev = process.env.NODE_ENV === "development";
      return NextResponse.json(
        {
          error: `Could not reach OpenRouter. ${hint}`,
          ...(isDev ? { detail } : {}),
        },
        { status: 502 }
      );
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      data?.error?.message ??
      data?.message ??
      `OpenRouter error (${res.status})`;
    return NextResponse.json({ error: msg }, { status: res.status || 502 });
  }

  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Empty response from model." },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: text.trim() });
}
