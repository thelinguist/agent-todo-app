import { z } from "zod"
import {
  todoListSchema,
  todoSchema,
  type Todo,
  type UpdateTodoInput,
} from "@todo/shared"

const BASE_PATH = "/todos"

const errorBodySchema = z.object({ error: z.string() })

export class ApiError extends Error {}

const request = async (path: string, init?: RequestInit): Promise<unknown> => {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    throw new ApiError("Could not reach the server")
  }
  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(
      await response.json().catch(() => null),
    )
    throw new ApiError(
      parsed.success
        ? parsed.data.error
        : `Request failed (${response.status})`,
    )
  }
  if (response.status === 204) return undefined
  return response.json()
}

export const listTodos = async (): Promise<Todo[]> =>
  todoListSchema.parse(await request(BASE_PATH))

export const createTodo = async (title: string): Promise<Todo> =>
  todoSchema.parse(
    await request(BASE_PATH, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  )

export const updateTodo = async (
  id: string,
  changes: UpdateTodoInput,
): Promise<Todo> =>
  todoSchema.parse(
    await request(`${BASE_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  )

export const deleteTodo = async (id: string): Promise<void> => {
  await request(`${BASE_PATH}/${id}`, { method: "DELETE" })
}
