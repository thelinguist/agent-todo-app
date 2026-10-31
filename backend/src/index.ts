import { serve } from "@hono/node-server"
import { createApp } from "./app"
import { loadConfig } from "./config"
import { logger } from "./lib/logger"
import { createPrismaClient, createPrismaTodoStore } from "./prisma-todo-store"

const { PORT, DATABASE_URL } = loadConfig(process.env)

const prisma = createPrismaClient(DATABASE_URL)
const app = createApp(createPrismaTodoStore(prisma))

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  logger.info("server listening", { port: info.port, database: DATABASE_URL })
})

const shutdown = () => {
  server.close(() => {
    void prisma.$disconnect().then(() => process.exit(0))
  })
}
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
