import {
  todoListSchema,
  todoSchema,
  type Todo,
  type UpdateTodoInput,
} from "@todo/shared"
import { z } from "zod"

const errorBodySchema = z.object({ error: z.string() })

const request = async (path: string, init?: RequestInit): Promise<Response> => {
  const response = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  })
  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(
      await response.json().catch(() => null),
    )
    throw new Error(
      parsed.success
        ? parsed.data.error
        : `Request failed (${response.status})`,
    )
  }
  return response
}

export const fetchTodos = async (): Promise<Todo[]> =>
  todoListSchema.parse(await (await request("/todos")).json())

export const createTodo = async (title: string): Promise<Todo> =>
  todoSchema.parse(
    await (
      await request("/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
      })
    ).json(),
  )

export const updateTodo = async (
  id: string,
  changes: UpdateTodoInput,
): Promise<Todo> =>
  todoSchema.parse(
    await (
      await request(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      })
    ).json(),
  )

export const deleteTodo = async (id: string): Promise<void> => {
  await request(`/todos/${id}`, { method: "DELETE" })
}
