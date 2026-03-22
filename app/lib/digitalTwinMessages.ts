export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export const MAX_MESSAGES = 24;
export const MAX_CONTENT_LENGTH = 8000;

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}

/**
 * Normalizes client-supplied history: only user/assistant roles, bounded size.
 * Content is trimmed to avoid ambiguous whitespace-only payloads.
 */
export function sanitizeMessages(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatTurn[] = [];
  for (const m of raw) {
    if (!isRecord(m)) continue;
    const role = m.role;
    const content = m.content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
    if (out.length >= MAX_MESSAGES) break;
  }
  return out.length ? out : null;
}
