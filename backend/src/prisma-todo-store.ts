import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import type { Todo } from "@todo/shared"
import { PrismaClient } from "./generated/prisma/client"
import type { TodoStore } from "./todo-store"

type TodoRow = {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

// Prisma error code for "record to update/delete does not exist".
const RECORD_NOT_FOUND = "P2025"

const toTodo = (row: TodoRow): Todo => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  createdAt: row.createdAt.toISOString(),
})

const isRecordNotFound = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === RECORD_NOT_FOUND

export const createPrismaClient = (databaseUrl: string): PrismaClient =>
  new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) })

export const createPrismaTodoStore = (prisma: PrismaClient): TodoStore => ({
  list: async () => {
    const rows = await prisma.todo.findMany({ orderBy: { seq: "asc" } })
    return rows.map(toTodo)
  },
  create: async (title) =>
    toTodo(await prisma.todo.create({ data: { title } })),
  update: async (id, changes) => {
    try {
      const row = await prisma.todo.update({
        where: { id },
        data: { title: changes.title, completed: changes.completed },
      })
      return toTodo(row)
    } catch (error) {
      if (isRecordNotFound(error)) return undefined
      throw error
    }
  },
  remove: async (id) => {
    const { count } = await prisma.todo.deleteMany({ where: { id } })
    return count > 0
  },
})
