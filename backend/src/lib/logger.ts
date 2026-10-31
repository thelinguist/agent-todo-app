type Level = "info" | "warn" | "error"

/**
 * Writes a single log line: `<ISO timestamp> <LEVEL> <message> [<context JSON>]`.
 * `info` goes to stdout; `warn` and `error` go to stderr.
 *
 * @param level - Severity of the entry.
 * @param message - Short, human-readable description of the event.
 * @param context - Optional structured data (e.g. `{ method, path, status }`)
 *   appended to the line as JSON. Must be JSON-serializable; omit when there is
 *   nothing to add. Never put secrets in it.
 */
const write = (
  level: Level,
  message: string,
  context?: Record<string, unknown>,
) => {
  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}${
    context ? ` ${JSON.stringify(context)}` : ""
  }\n`
  if (level === "info") process.stdout.write(line)
  else process.stderr.write(line)
}

/**
 * Minimal structured logger. Each method takes a `message` describing the
 * event and an optional `context` object of extra key/value details that is
 * serialized as JSON on the same line.
 */
export const logger = {
  /** Logs normal operational events to stdout. */
  info: (message: string, context?: Record<string, unknown>) =>
    write("info", message, context),
  /** Logs recoverable or unexpected situations to stderr. */
  warn: (message: string, context?: Record<string, unknown>) =>
    write("warn", message, context),
  /** Logs failures to stderr. */
  error: (message: string, context?: Record<string, unknown>) =>
    write("error", message, context),
}
