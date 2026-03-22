"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ChatTurn } from "../../lib/digitalTwinMessages";
import Card from "../ui/Card";

type UiTurn = ChatTurn & { id: string };

function digitalTwinChatUrl(): string {
  if (typeof window === "undefined") return "/api/digital-twin/chat";
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  return `${window.location.origin}${base}/api/digital-twin/chat`;
}

/**
 * Converts UI messages to API turns, skipping the optimistic blank assistant
 * placeholder that is added while streaming. Only fully-committed turns with
 * non-empty content are sent to the server.
 */
function toApiTurns(msgs: UiTurn[]): ChatTurn[] {
  return msgs
    .filter(({ content }) => content.trim().length > 0)
    .map(({ role, content }) => ({ role, content: content.trim() }));
}

async function consumeAssistantStream(
  body: ReadableStream<Uint8Array>,
  scheduleAppend: (chunk: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) scheduleAppend(delta);
      } catch {
        /* ignore malformed chunks */
      }
    }
  }
}

export default function DigitalTwinChat() {
  const [messages, setMessages] = useState<UiTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const messagesRef = useRef<UiTurn[]>([]);
  const pendingStreamRef = useRef("");
  const rafFlushRef = useRef<number | null>(null);

  // Keep ref in sync so send() can read the latest messages without closure stale-state issues.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading, scrollToEnd]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    return () => {
      if (rafFlushRef.current != null) {
        cancelAnimationFrame(rafFlushRef.current);
      }
    };
  }, []);

  const flushPendingStreamChars = useCallback(() => {
    rafFlushRef.current = null;
    const chunk = pendingStreamRef.current;
    pendingStreamRef.current = "";
    if (!chunk) return;
    setMessages((m) => {
      const next = [...m];
      const last = next[next.length - 1];
      if (last?.role !== "assistant") return next;
      next[next.length - 1] = {
        ...last,
        content: last.content + chunk,
      };
      return next;
    });
  }, []);

  const scheduleStreamAppend = useCallback(
    (chunk: string) => {
      pendingStreamRef.current += chunk;
      if (rafFlushRef.current == null) {
        rafFlushRef.current = requestAnimationFrame(flushPendingStreamChars);
      }
    },
    [flushPendingStreamChars],
  );

  // setState updater runs synchronously so historyForApi is assigned before await fetch.
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loadingRef.current) return;

      setError(null);

      // Build the API payload from the ref (stable, not subject to React re-render batching).
      const historyForApi: ChatTurn[] = [
        ...toApiTurns(messagesRef.current),
        { role: "user", content: trimmed },
      ];

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: trimmed },
        { id: crypto.randomUUID(), role: "assistant", content: "" },
      ]);

      setInput("");
      setLoading(true);
      loadingRef.current = true;

      const readErrorBody = async (res: Response): Promise<string> => {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          return data?.error ?? "Something went wrong.";
        }
        const raw = await res.text();
        const t = raw.trim();
        if (
          t.startsWith("<!DOCTYPE") ||
          t.startsWith("<html") ||
          raw.includes("<html")
        ) {
          return "The chat API returned an HTML error page instead of data—often a server crash, bad deploy, or wrong URL. Refresh the page and check the server or dev terminal logs.";
        }
        return t.slice(0, 240) || "Unexpected response from the server.";
      };

      try {
        const res = await fetch(digitalTwinChatUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
          },
          body: JSON.stringify({ messages: historyForApi }),
          credentials: "same-origin",
        });
        const ct = res.headers.get("content-type") ?? "";

        if (ct.includes("application/json")) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
            retryAfterSec?: number;
          };
          if (!res.ok) {
            setError(
              data?.error ??
                (res.status === 429
                  ? "Too many requests. Please wait and try again."
                  : "Something went wrong."),
            );
            setMessages((m) => m.slice(0, -2));
            return;
          }
          const reply = data?.message;
          if (typeof reply !== "string") {
            setError("Unexpected response.");
            setMessages((m) => m.slice(0, -2));
            return;
          }
          setMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content: reply.trim(),
              };
            }
            return next;
          });
          return;
        }

        if (res.ok && ct.includes("text/event-stream") && res.body) {
          let gotChunk = false;
          await consumeAssistantStream(res.body, (chunk) => {
            gotChunk = true;
            scheduleStreamAppend(chunk);
          });
          if (pendingStreamRef.current || rafFlushRef.current != null) {
            if (rafFlushRef.current != null) {
              cancelAnimationFrame(rafFlushRef.current);
              rafFlushRef.current = null;
            }
            flushPendingStreamChars();
          }
          if (!gotChunk) {
            setError("Empty response from model.");
            setMessages((m) => m.slice(0, -2));
          }
          return;
        }

        if (!res.ok) {
          setError(await readErrorBody(res));
          setMessages((m) => m.slice(0, -2));
          return;
        }

        setError(
          "Unexpected response format from the server. Please refresh and try again.",
        );
        setMessages((m) => m.slice(0, -2));
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("[digital-twin]", err);
        }
        setError("Network error. Try again.");
        setMessages((m) => m.slice(0, -2));
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [flushPendingStreamChars, scheduleStreamAppend],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    void send(trimmed);
  };

  return (
    <Card className="digital-twin-card">
      <div
        ref={listRef}
        className="digital-twin-messages"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <p className="digital-twin-empty">
            Ask about my experience with Power BI, past roles, certifications,
            or how I approach executive reporting.
          </p>
        ) : (
          messages.map((m, i) => {
            const isLastAssistant =
              m.role === "assistant" && i === messages.length - 1;
            const showThinking = isLastAssistant && loading && !m.content;
            return (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "digital-twin-bubble digital-twin-bubble-user"
                    : `digital-twin-bubble digital-twin-bubble-assistant${
                        showThinking ? " digital-twin-thinking" : ""
                      }`.trim()
                }
              >
                {showThinking ? "Thinking…" : m.content}
              </div>
            );
          })
        )}
      </div>
      {error ? (
        <p className="digital-twin-error" role="alert">
          {error}
        </p>
      ) : null}
      <form className="digital-twin-form" onSubmit={onSubmit}>
        <label className="digital-twin-label" htmlFor="digital-twin-input">
          Your question
        </label>
        <textarea
          id="digital-twin-input"
          className="digital-twin-input"
          rows={2}
          placeholder="Ask about my career…"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const trimmed = e.currentTarget.value.trim();
              if (!trimmed) return;
              void send(trimmed);
            }
          }}
        />
        <button
          type="submit"
          className="button digital-twin-send"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </Card>
  );
}
