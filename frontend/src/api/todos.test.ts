import { afterEach, describe, expect, it, vi } from "vitest"
import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./todos"

const todo = {
  id: "7d1f1c0e-2d4b-4a39-8f0a-6a3a5a1f2b11",
  title: "t",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
}

const respond = (status: number, body?: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  )

afterEach(() => vi.restoreAllMocks())

describe("todos api", () => {
  it("fetches and validates the list", async () => {
    respond(200, [todo])
    expect(await fetchTodos()).toEqual([todo])
  })
  it("rejects responses that do not match the schema", async () => {
    respond(200, [{ nope: true }])
    await expect(fetchTodos()).rejects.toThrow()
  })
  it("creates a todo with a POST body", async () => {
    const spy = respond(201, todo)
    expect(await createTodo("t")).toEqual(todo)
    expect(spy).toHaveBeenCalledWith(
      "/todos",
      expect.objectContaining({ method: "POST", body: '{"title":"t"}' }),
    )
  })
  it("updates a todo with PATCH", async () => {
    const spy = respond(200, { ...todo, completed: true })
    expect((await updateTodo(todo.id, { completed: true })).completed).toBe(
      true,
    )
    expect(spy).toHaveBeenCalledWith(
      `/todos/${todo.id}`,
      expect.objectContaining({ method: "PATCH" }),
    )
  })
  it("deletes a todo", async () => {
    const spy = respond(204)
    await deleteTodo(todo.id)
    expect(spy).toHaveBeenCalledWith(
      `/todos/${todo.id}`,
      expect.objectContaining({ method: "DELETE" }),
    )
  })
  it("surfaces the server error message", async () => {
    respond(400, { error: "Title is required" })
    await expect(createTodo("")).rejects.toThrow("Title is required")
  })
  it("falls back to a status message for non-JSON errors", async () => {
    respond(500)
    await expect(fetchTodos()).rejects.toThrow("Request failed (500)")
  })
})
