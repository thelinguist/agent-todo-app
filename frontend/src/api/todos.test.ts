import { afterEach, describe, expect, it, vi } from "vitest"
import {
  ApiError,
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "./todos"

const TODO = {
  id: crypto.randomUUID(),
  title: "a",
  completed: false,
  createdAt: new Date().toISOString(),
}

const mockFetch = (response: Response | Error) => {
  const fn = vi.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  )
  vi.stubGlobal("fetch", fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("todos api", () => {
  it("lists todos", async () => {
    mockFetch(Response.json([TODO]))
    expect(await listTodos()).toEqual([TODO])
  })

  it("creates a todo with a POST body", async () => {
    const fn = mockFetch(Response.json(TODO, { status: 201 }))
    expect(await createTodo("a")).toEqual(TODO)
    expect(fn).toHaveBeenCalledWith(
      "/todos",
      expect.objectContaining({ method: "POST", body: '{"title":"a"}' }),
    )
  })

  it("updates a todo with PATCH", async () => {
    const fn = mockFetch(Response.json(TODO))
    await updateTodo(TODO.id, { completed: true })
    expect(fn).toHaveBeenCalledWith(
      `/todos/${TODO.id}`,
      expect.objectContaining({ method: "PATCH" }),
    )
  })

  it("deletes a todo on 204", async () => {
    mockFetch(new Response(null, { status: 204 }))
    await expect(deleteTodo(TODO.id)).resolves.toBeUndefined()
  })

  it("uses the server error message", async () => {
    mockFetch(Response.json({ error: "Todo not found" }, { status: 404 }))
    await expect(deleteTodo("x")).rejects.toThrow("Todo not found")
  })

  it("falls back to the status when the error body is unreadable", async () => {
    mockFetch(new Response("oops", { status: 500 }))
    await expect(listTodos()).rejects.toThrow("Request failed (500)")
  })

  it("reports network failures", async () => {
    mockFetch(new Error("down"))
    await expect(listTodos()).rejects.toBeInstanceOf(ApiError)
  })
})
