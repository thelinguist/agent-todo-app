import { beforeEach, describe, expect, it } from "vitest"
import { createInMemoryTodoStore, type TodoStore } from "./todo-store"

let store: TodoStore
beforeEach(() => {
  store = createInMemoryTodoStore()
})

describe("in-memory todo store", () => {
  it("creates and lists in insertion order", () => {
    const a = store.create("a")
    const b = store.create("b")
    expect(store.list().map((t) => t.id)).toEqual([a.id, b.id])
    expect(a.completed).toBe(false)
  })
  it("updates title and completed independently", () => {
    const a = store.create("a")
    expect(store.update(a.id, { completed: true })).toMatchObject({
      title: "a",
      completed: true,
    })
    expect(store.update(a.id, { title: "z" })).toMatchObject({
      title: "z",
      completed: true,
    })
  })
  it("returns undefined when updating an unknown id", () => {
    expect(store.update("nope", { completed: true })).toBeUndefined()
  })
  it("removes todos", () => {
    const a = store.create("a")
    expect(store.remove(a.id)).toBe(true)
    expect(store.remove(a.id)).toBe(false)
    expect(store.list()).toEqual([])
  })
})
