/**
 * Runtime validation for POST /api/digital-twin/chat JSON body (no `as` casts on unknown).
 */
export function parseChatPostBody(
  body: unknown,
): { ok: true; messagesRaw: unknown } | { ok: false; error: string } {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body." };
  }
  if (!("messages" in body)) {
    return { ok: false, error: "Missing messages array." };
  }
  return { ok: true, messagesRaw: (body as Record<string, unknown>).messages };
}
