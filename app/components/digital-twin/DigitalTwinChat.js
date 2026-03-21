"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Card from "../ui/Card";

export default function DigitalTwinChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading, scrollToEnd]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const nextUser = { role: "user", content: text };
    const historyForApi = [...messages, nextUser];
    setMessages(historyForApi);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/digital-twin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        setMessages((m) => m.slice(0, -1));
        return;
      }
      const reply = data?.message;
      if (typeof reply !== "string") {
        setError("Unexpected response.");
        setMessages((m) => m.slice(0, -1));
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setError("Network error. Try again.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const onSubmit = (e) => {
    e.preventDefault();
    send();
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
            Ask about my experience with Power BI, past roles, certifications, or
            how I approach executive reporting.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={
                m.role === "user"
                  ? "digital-twin-bubble digital-twin-bubble-user"
                  : "digital-twin-bubble digital-twin-bubble-assistant"
              }
            >
              {m.content}
            </div>
          ))
        )}
        {loading ? (
          <div className="digital-twin-bubble digital-twin-bubble-assistant digital-twin-thinking">
            Thinking…
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="digital-twin-error" role="alert">
          {error}
        </p>
      ) : null}
      <form className="digital-twin-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="digital-twin-input">
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
              send();
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
