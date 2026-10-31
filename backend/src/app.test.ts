import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "./app"
import { loadConfig } from "./config"
import type { TodoStore } from "./todo-store"

vi.mock("./lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

let app: ReturnType<typeof createApp>
beforeEach(() => {
  app = createApp()
})

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
})

const add = async (title: string) => {
  const res = await app.request("/todos", json("POST", { title }))
  return (await res.json()) as { id: string; title: string; completed: boolean }
}

describe("GET /todos", () => {
  it("returns an empty list, then todos oldest first", async () => {
    expect(await (await app.request("/todos")).json()).toEqual([])
    await add("one")
    await add("two")
    const list = (await (await app.request("/todos")).json()) as {
      title: string
    }[]
    expect(list.map((t) => t.title)).toEqual(["one", "two"])
  })
})

describe("POST /todos", () => {
  it("creates a trimmed todo", async () => {
    const res = await app.request(
      "/todos",
      json("POST", { title: "  Buy milk " }),
    )
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({
      title: "Buy milk",
      completed: false,
    })
  })
  it.each<unknown>([
    {},
    { title: "  " },
    { title: "a".repeat(201) },
    { title: 5 },
  ])("rejects %j with 400", async (body) => {
    const res = await app.request("/todos", json("POST", body))
    expect(res.status).toBe(400)
    expect(Object.keys((await res.json()) as object)).toEqual(["error"])
  })
  it("rejects malformed JSON with 400", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{oops",
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "Malformed request body" })
  })
})

describe("PATCH /todos/:id", () => {
  it("updates title and completed", async () => {
    const todo = await add("a")
    const res = await app.request(
      `/todos/${todo.id}`,
      json("PATCH", { title: "b", completed: true }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      id: todo.id,
      title: "b",
      completed: true,
    })
  })
  it("rejects empty bodies and invalid titles", async () => {
    const todo = await add("a")
    expect(
      (await app.request(`/todos/${todo.id}`, json("PATCH", {}))).status,
    ).toBe(400)
    expect(
      (await app.request(`/todos/${todo.id}`, json("PATCH", { title: "" })))
        .status,
    ).toBe(400)
  })
  it("returns 404 for unknown ids", async () => {
    const res = await app.request(
      "/todos/missing",
      json("PATCH", { completed: true }),
    )
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: "Todo not found" })
  })
})

describe("DELETE /todos/:id", () => {
  it("deletes a todo", async () => {
    const todo = await add("a")
    const res = await app.request(`/todos/${todo.id}`, { method: "DELETE" })
    expect(res.status).toBe(204)
    expect(
      (await app.request(`/todos/${todo.id}`, { method: "DELETE" })).status,
    ).toBe(404)
  })
})

describe("app errors", () => {
  it("returns 404 json for unknown routes", async () => {
    const res = await app.request("/nope")
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: "Not found" })
  })
  it("returns 500 for unexpected errors", async () => {
    const broken: TodoStore = {
      list: () => Promise.reject(new Error("boom")),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    }
    const res = await createApp(broken).request("/todos")
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: "Internal server error" })
  })
})

describe("loadConfig", () => {
  it("defaults PORT to 3000 and reads overrides", () => {
    expect(loadConfig({}).PORT).toBe(3000)
    expect(loadConfig({ PORT: "4100" }).PORT).toBe(4100)
  })
  it("defaults DATABASE_URL to a local sqlite file and reads overrides", () => {
    expect(loadConfig({}).DATABASE_URL).toBe("file:./todos.db")
    expect(loadConfig({ DATABASE_URL: "file:./x.db" }).DATABASE_URL).toBe(
      "file:./x.db",
    )
  })
  it("rejects invalid ports", () => {
    expect(() => loadConfig({ PORT: "abc" })).toThrow()
  })
})
