import { serve } from "@hono/node-server"
import { createApp } from "./app"
import { loadConfig } from "./config"
import { logger } from "./lib/logger"

const { PORT } = loadConfig(process.env)

serve({ fetch: createApp().fetch, port: PORT }, (info) => {
  logger.info("server listening", { port: info.port })
})
