import assert from "node:assert/strict";
import { test } from "node:test";
import { profile } from "../app/content/profile";
import {
  getChatHistory,
  resolveDigitalTwinSession,
  setChatHistory,
  validateChatContinuation,
} from "../app/lib/chatSession";
import { parseChatPostBody } from "../app/lib/chatRequest";
import { connectionErrorDetail } from "../app/lib/connectionDetail";
import { buildDigitalTwinSystemPrompt } from "../app/lib/digitalTwinContext";
import type { ChatTurn } from "../app/lib/digitalTwinMessages";
import { MAX_MESSAGES, sanitizeMessages } from "../app/lib/digitalTwinMessages";
import { checkRateLimit } from "../app/lib/rateLimit";
import { wrapSseStreamWithSessionCommit } from "../app/lib/openRouterSseAccumulate";

test("sanitizeMessages returns null for non-array", () => {
  assert.equal(sanitizeMessages(null), null);
  assert.equal(sanitizeMessages(undefined), null);
});

test("sanitizeMessages keeps only user and assistant roles", () => {
  const out = sanitizeMessages([
    { role: "system", content: "hidden" },
    { role: "user", content: "hi" },
    { role: "assistant", content: "Hello" },
  ]);
  assert.ok(out);
  assert.equal(out!.length, 2);
  assert.equal(out![0].role, "user");
  assert.equal(out![0].content, "hi");
});

test("sanitizeMessages trims content", () => {
  const out = sanitizeMessages([{ role: "user", content: "  spaced  " }]);
  assert.ok(out);
  assert.equal(out![0].content, "spaced");
});

test("sanitizeMessages caps message count at MAX_MESSAGES", () => {
  const many = Array.from({ length: MAX_MESSAGES + 8 }, (_, i) => ({
    role: "user" as const,
    content: `m${i}`,
  }));
  const out = sanitizeMessages(many);
  assert.ok(out);
  assert.equal(out!.length, MAX_MESSAGES);
});

test("parseChatPostBody rejects arrays", () => {
  const r = parseChatPostBody([]);
  assert.equal(r.ok, false);
});

test("parseChatPostBody accepts messages field", () => {
  const r = parseChatPostBody({ messages: [] });
  assert.equal(r.ok, true);
});

test("resolveDigitalTwinSession migrates anon history to sid when cookie appears", () => {
  const ip = "203.0.113.50";
  const anonKey = `dt:anon:${ip}`;
  const sid = "test-session-uuid";
  const sidKey = `dt:sid:${sid}`;
  setChatHistory(anonKey, [{ role: "user", content: "hi" }]);
  const r = resolveDigitalTwinSession(sid, ip);
  assert.equal(r.sessionKey, sidKey);
  assert.equal(r.history.length, 1);
  assert.equal(getChatHistory(sidKey).length, 1);
});

test("validateChatContinuation allows first user message", () => {
  const client = [{ role: "user" as const, content: "Hi" }];
  const v = validateChatContinuation([], client);
  assert.equal(v.ok, true);
  if (v.ok) assert.equal(v.newUserMessage.content, "Hi");
});

test("validateChatContinuation rejects tampered assistant", () => {
  setChatHistory("t1", [
    { role: "user", content: "a" },
    { role: "assistant", content: "real" },
  ]);
  const client: ChatTurn[] = [
    { role: "user", content: "a" },
    { role: "assistant", content: "fake" },
    { role: "user", content: "b" },
  ];
  const v = validateChatContinuation(getChatHistory("t1"), client);
  assert.equal(v.ok, false);
});

test("validateChatContinuation accepts valid extension", () => {
  setChatHistory("t2", [
    { role: "user", content: "a" },
    { role: "assistant", content: "reply" },
  ]);
  const client: ChatTurn[] = [
    { role: "user", content: "a" },
    { role: "assistant", content: "reply" },
    { role: "user", content: "next" },
  ];
  const v = validateChatContinuation(getChatHistory("t2"), client);
  assert.equal(v.ok, true);
});

test("buildDigitalTwinSystemPrompt includes profile identity", () => {
  const prompt = buildDigitalTwinSystemPrompt(profile);
  assert.ok(prompt.includes(profile.name));
  assert.ok(prompt.includes("## Experience"));
  assert.ok(prompt.includes("## Skills"));
  assert.ok(prompt.includes("Anglo Gold"));
});

test("buildDigitalTwinSystemPrompt tolerates empty experience", () => {
  const prompt = buildDigitalTwinSystemPrompt({
    ...profile,
    experience: [],
  });
  assert.ok(prompt.includes("## Experience"));
});

test("connectionErrorDetail handles Error", () => {
  assert.ok(connectionErrorDetail(new Error("x")).includes("x"));
});

test("checkRateLimit allows then blocks within the same window", () => {
  const key = `test-${Math.random()}`;
  for (let i = 0; i < 3; i++) {
    assert.equal(checkRateLimit(key, 3, 60_000).ok, true);
  }
  const blocked = checkRateLimit(key, 3, 60_000);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.ok(blocked.retryAfterSec > 0);
  }
});

test("wrapSseStreamWithSessionCommit forwards and accumulates text", async () => {
  const encoder = new TextEncoder();
  const chunk =
    'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: [DONE]\n\n';
  const upstream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  let completed = "";
  const wrapped = wrapSseStreamWithSessionCommit(upstream, (t) => {
    completed = t;
  });
  const reader = wrapped.getReader();
  while (!(await reader.read()).done) {
    /* drain */
  }
  assert.equal(completed, "Hello");
});
