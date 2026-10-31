import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { logger } from "./lib/logger"
import { NotFoundError, ValidationError } from "./lib/errors"
import { createTodoRoutes } from "./routes/todos"
import { createInMemoryTodoStore, type TodoStore } from "./todo-store"

export const createApp = (store: TodoStore = createInMemoryTodoStore()) => {
  const app = new Hono()

  app.use(async (c, next) => {
    await next()
    logger.info("request", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
    })
  })

  app.route("/todos", createTodoRoutes(store))

  app.notFound((c) => c.json({ error: "Not found" }, 404))

  app.onError((err, c): Response => {
    if (err instanceof NotFoundError) return c.json({ error: err.message }, 404)
    if (err instanceof ValidationError)
      return c.json({ error: err.message }, 400)
    if (err instanceof HTTPException && err.status === 400) {
      return c.json({ error: "Malformed request body" }, 400)
    }
    logger.error("unhandled error", { message: err.message })
    return c.json({ error: "Internal server error" }, 500)
  })

  return app
}
