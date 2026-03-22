import type { ChatTurn } from "./digitalTwinMessages";

const MAX_SESSIONS = 2000;
const MAX_TURNS = 48;

const store = new Map<string, ChatTurn[]>();

function pruneSessionsIfNeeded() {
  if (store.size <= MAX_SESSIONS) return;
  const drop = Math.ceil(store.size * 0.1);
  let i = 0;
  for (const key of store.keys()) {
    store.delete(key);
    if (++i >= drop) break;
  }
}

export function getChatHistory(sessionKey: string): ChatTurn[] {
  return store.get(sessionKey) ?? [];
}

/**
 * Chat history must stay on one stable key. The first POST often has no `dt_sid` yet (cookie is
 * set on that response), so we store under `dt:anon:<ip>`. Later POSTs send the cookie; we migrate
 * anon → sid so validation still matches the client transcript.
 */
export function resolveDigitalTwinSession(
  sessionId: string | undefined,
  ip: string,
): { sessionKey: string; history: ChatTurn[] } {
  const anonKey = `dt:anon:${ip}`;
  if (!sessionId?.trim()) {
    return { sessionKey: anonKey, history: getChatHistory(anonKey) };
  }
  const sidKey = `dt:sid:${sessionId}`;
  let history = getChatHistory(sidKey);
  if (history.length === 0) {
    const fromAnon = getChatHistory(anonKey);
    if (fromAnon.length > 0) {
      setChatHistory(sidKey, fromAnon);
      history = fromAnon;
    }
  }
  return { sessionKey: sidKey, history };
}

export function setChatHistory(sessionKey: string, history: ChatTurn[]): void {
  pruneSessionsIfNeeded();
  const trimmed = history.slice(-MAX_TURNS);
  store.set(sessionKey, trimmed);
}

/**
 * Ensures the client cannot inject or alter assistant text: every prior turn must match
 * server-stored history; the client may only append one new user message.
 */
export function validateChatContinuation(
  serverHistory: ChatTurn[],
  clientProposal: ChatTurn[],
): { ok: true; newUserMessage: ChatTurn } | { ok: false; error: string } {
  if (clientProposal.length < 1) {
    return { ok: false, error: "Provide a non-empty messages array." };
  }
  const last = clientProposal[clientProposal.length - 1];
  if (last.role !== "user") {
    return {
      ok: false,
      error: "The latest message must be from the user.",
    };
  }
  if (clientProposal.length !== serverHistory.length + 1) {
    return {
      ok: false,
      error:
        "Conversation out of sync with the server. Refresh the page and try again.",
    };
  }
  for (let i = 0; i < serverHistory.length; i++) {
    const a = serverHistory[i];
    const b = clientProposal[i];
    if (a.role !== b.role || a.content !== b.content) {
      return {
        ok: false,
        error:
          "Conversation was modified or is out of date. Refresh the page and try again.",
      };
    }
  }
  return { ok: true, newUserMessage: last };
}
