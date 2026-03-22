function appendDeltaFromLine(line: string, into: { text: string }) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return;
  const data = trimmed.slice(6);
  if (data === "[DONE]") return;
  try {
    const json = JSON.parse(data) as {
      choices?: { delta?: { content?: string } }[];
    };
    const delta = json?.choices?.[0]?.delta?.content;
    if (typeof delta === "string") into.text += delta;
  } catch {
    /* ignore malformed */
  }
}

/**
 * Wraps an upstream SSE stream: forwards bytes to the client and accumulates assistant text for session commit.
 */
export function wrapSseStreamWithSessionCommit(
  upstream: ReadableStream<Uint8Array>,
  onComplete: (assistantText: string) => void,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";
  const acc = { text: "" };

  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        buffer += decoder.decode(chunk, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const line of parts) {
          appendDeltaFromLine(line, acc);
        }
      },
      flush() {
        buffer += decoder.decode();
        const parts = buffer.split("\n");
        for (const line of parts) {
          appendDeltaFromLine(line, acc);
        }
        buffer = "";
        try {
          onComplete(acc.text);
        } catch (e) {
          console.error(
            "[digital-twin] Session commit after stream failed:",
            e,
          );
        }
      },
    }),
  );
}
