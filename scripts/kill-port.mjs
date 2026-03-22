/**
 * Kills any process listening on PORT (default 3000) before starting the dev server.
 * Works on Windows without any extra npm packages.
 */
import { execSync } from "child_process";

const port = process.env.PORT ?? "3000";

try {
  const out = execSync(`netstat -ano | findstr ":${port} "`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const pids = [
    ...new Set(
      out
        .split("\n")
        .filter((l) => l.includes("LISTENING"))
        .map((l) => l.trim().split(/\s+/).at(-1))
        .filter(Boolean),
    ),
  ];
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Killed PID ${pid} on port ${port}`);
    } catch {
      /* already gone */
    }
  }
} catch {
  /* nothing listening — that's fine */
}
