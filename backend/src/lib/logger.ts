type Level = "info" | "warn" | "error"

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

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    write("error", message, context),
}
