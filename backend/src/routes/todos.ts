import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { ZodType } from "zod"
import { z } from "zod"
import { createTodoSchema, updateTodoSchema } from "@todo/shared"
import { NotFoundError, ValidationError } from "../lib/errors"
import type { TodoStore } from "../todo-store"

const paramSchema = z.object({ id: z.string().min(1) })

// Throw instead of formatting responses; app.onError builds the error shape.
const validate = <T extends ZodType>(target: "json" | "param", schema: T) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join("; "),
      )
    }
  })

export const createTodoRoutes = (store: TodoStore) =>
  new Hono()
    .get("/", async (c) => c.json(await store.list()))
    .post("/", validate("json", createTodoSchema), async (c) => {
      const { title } = c.req.valid("json")
      return c.json(await store.create(title), 201)
    })
    .patch(
      "/:id",
      validate("param", paramSchema),
      validate("json", updateTodoSchema),
      async (c) => {
        const { id } = c.req.valid("param")
        const todo = await store.update(id, c.req.valid("json"))
        if (!todo) throw new NotFoundError()
        return c.json(todo)
      },
    )
    .delete("/:id", validate("param", paramSchema), async (c) => {
      const { id } = c.req.valid("param")
      if (!(await store.remove(id))) throw new NotFoundError()
      return c.body(null, 204)
    })
