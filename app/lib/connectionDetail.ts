/**
 * Best-effort message extraction from thrown values (fetch errors, AggregateError, etc.).
 */
export function connectionErrorDetail(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause;
    if (cause instanceof Error && cause.message) return cause.message;
    if (err.message) return err.message;
  }
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err ?? "Unknown network error");
}
