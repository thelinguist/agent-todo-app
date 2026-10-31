import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { PrismaClient } from "./generated/prisma/client"
import { createPrismaClient, createPrismaTodoStore } from "./prisma-todo-store"
import type { TodoStore } from "./todo-store"

const MIGRATIONS_DIR = join(import.meta.dirname, "../prisma/migrations")

// Applies the real migration files so the test schema can't drift from production.
const applyMigrations = async (prisma: PrismaClient) => {
  const folders = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
  for (const folder of folders) {
    const sql = readFileSync(
      join(MIGRATIONS_DIR, folder, "migration.sql"),
      "utf8",
    )
    for (const statement of sql.split(";").map((s) => s.trim())) {
      if (statement) await prisma.$executeRawUnsafe(statement)
    }
  }
}

let prisma: PrismaClient
let store: TodoStore
beforeEach(async () => {
  prisma = createPrismaClient("file::memory:")
  await applyMigrations(prisma)
  store = createPrismaTodoStore(prisma)
})
afterEach(async () => {
  await prisma.$disconnect()
})

describe("prisma todo store", () => {
  it("creates todos and lists them oldest first", async () => {
    const a = await store.create("a")
    const b = await store.create("b")
    expect(a.completed).toBe(false)
    expect(Number.isNaN(Date.parse(a.createdAt))).toBe(false)
    expect((await store.list()).map((t) => t.id)).toEqual([a.id, b.id])
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
  it("rethrows unexpected database errors", async () => {
    // A fresh database without migrations fails with "no such table", not P2025.
    const unmigrated = createPrismaClient("file::memory:")
    const broken = createPrismaTodoStore(unmigrated)
    await expect(broken.update("x", { title: "y" })).rejects.toThrow()
    await unmigrated.$disconnect()
  })
})
