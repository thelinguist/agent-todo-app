import type { Todo, UpdateTodoInput } from "@todo/shared"

export type TodoStore = {
  list: () => Promise<Todo[]>
  create: (title: string) => Promise<Todo>
  update: (id: string, changes: UpdateTodoInput) => Promise<Todo | undefined>
  remove: (id: string) => Promise<boolean>
}

export const createInMemoryTodoStore = (): TodoStore => {
  const todos = new Map<string, Todo>()

  return {
    list: () => Promise.resolve([...todos.values()]),
    create: (title) => {
      const todo: Todo = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      todos.set(todo.id, todo)
      return Promise.resolve(todo)
    },
    update: (id, changes) => {
      const existing = todos.get(id)
      const updated = existing && {
        ...existing,
        ...(changes.title !== undefined && { title: changes.title }),
        ...(changes.completed !== undefined && {
          completed: changes.completed,
        }),
      }
      if (updated) todos.set(id, updated)
      return Promise.resolve(updated)
    },
    remove: (id) => Promise.resolve(todos.delete(id)),
  }
}
