import { z } from "zod"

export const MAX_TITLE_LENGTH = 200

export const titleSchema = z
  .string({ error: "Title is required" })
  .trim()
  .min(1, "Title must be at least 1 character")
  .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`)

export const todoSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const createTodoSchema = z.object({ title: titleSchema })

export const updateTodoSchema = z
  .object({ title: titleSchema.optional(), completed: z.boolean().optional() })
  .refine((v) => v.title !== undefined || v.completed !== undefined, {
    message: "Provide title or completed",
  })

export const todoListSchema = z.array(todoSchema)

export type Todo = z.infer<typeof todoSchema>
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
