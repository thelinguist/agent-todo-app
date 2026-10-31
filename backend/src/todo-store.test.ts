import { beforeEach, describe, expect, it } from "vitest"
import { createInMemoryTodoStore, type TodoStore } from "./todo-store"

let store: TodoStore
beforeEach(() => {
  store = createInMemoryTodoStore()
})

describe("in-memory todo store", () => {
  it("creates and lists in insertion order", async () => {
    const a = await store.create("a")
    const b = await store.create("b")
    expect((await store.list()).map((t) => t.id)).toEqual([a.id, b.id])
    expect(a.completed).toBe(false)
  })
  it("updates title and completed independently", async () => {
    const a = await store.create("a")
    expect(await store.update(a.id, { completed: true })).toMatchObject({
      title: "a",
      completed: true,
    })
    expect(await store.update(a.id, { title: "z" })).toMatchObject({
      title: "z",
      completed: true,
    })
  })
  it("returns undefined when updating an unknown id", async () => {
    expect(await store.update("nope", { completed: true })).toBeUndefined()
  })
  it("removes todos", async () => {
    const a = await store.create("a")
    expect(await store.remove(a.id)).toBe(true)
    expect(await store.remove(a.id)).toBe(false)
    expect(await store.list()).toEqual([])
  })
})
