import { describe, expect, it } from "vitest"
import { createTodoSchema, updateTodoSchema, todoSchema } from "./todo"

describe("createTodoSchema", () => {
  it("trims the title", () => {
    expect(createTodoSchema.parse({ title: "  hi  " }).title).toBe("hi")
  })
  it("rejects blank and too-long titles", () => {
    expect(createTodoSchema.safeParse({ title: "   " }).success).toBe(false)
    expect(createTodoSchema.safeParse({ title: "a".repeat(201) }).success).toBe(
      false,
    )
    expect(createTodoSchema.safeParse({ title: "a".repeat(200) }).success).toBe(
      true,
    )
  })
  it("rejects a missing title", () => {
    expect(createTodoSchema.safeParse({}).success).toBe(false)
  })
})

describe("updateTodoSchema", () => {
  it("requires at least one field", () => {
    expect(updateTodoSchema.safeParse({}).success).toBe(false)
    expect(updateTodoSchema.safeParse({ completed: false }).success).toBe(true)
    expect(updateTodoSchema.safeParse({ title: "x" }).success).toBe(true)
  })
})

describe("todoSchema", () => {
  it("accepts a valid todo", () => {
    expect(
      todoSchema.safeParse({
        id: crypto.randomUUID(),
        title: "t",
        completed: false,
        createdAt: new Date().toISOString(),
      }).success,
    ).toBe(true)
  })
})
