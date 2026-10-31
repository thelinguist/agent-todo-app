import type { Todo, UpdateTodoInput } from "@todo/shared"

export type TodoStore = {
  list: () => Todo[]
  create: (title: string) => Todo
  update: (id: string, changes: UpdateTodoInput) => Todo | undefined
  remove: (id: string) => boolean
}

export const createInMemoryTodoStore = (): TodoStore => {
  const todos = new Map<string, Todo>()

  return {
    list: () => [...todos.values()],
    create: (title) => {
      const todo: Todo = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      todos.set(todo.id, todo)
      return todo
    },
    update: (id, changes) => {
      const existing = todos.get(id)
      if (!existing) return undefined
      const updated: Todo = {
        ...existing,
        ...(changes.title !== undefined && { title: changes.title }),
        ...(changes.completed !== undefined && {
          completed: changes.completed,
        }),
      }
      todos.set(id, updated)
      return updated
    },
    remove: (id) => todos.delete(id),
  }
}
