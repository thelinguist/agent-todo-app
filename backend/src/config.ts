import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1).default("file:./todos.db"),
})

export type Config = z.infer<typeof envSchema>

export const loadConfig = (env: Record<string, string | undefined>): Config =>
  envSchema.parse(env)
