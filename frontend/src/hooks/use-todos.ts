import { useCallback, useEffect, useState } from "react"
import type { Todo, UpdateTodoInput } from "@todo/shared"
import * as api from "../api/todos"

export type Filter = "all" | "active" | "completed"

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong"

export const filterTodos = (todos: Todo[], filter: Filter): Todo[] => {
  if (filter === "active") return todos.filter((todo) => !todo.completed)
  if (filter === "completed") return todos.filter((todo) => todo.completed)
  return todos
}

const replaceTodo = (todos: Todo[], updated: Todo): Todo[] =>
  todos.map((todo) => (todo.id === updated.id ? updated : todo))

const withoutTodo = (todos: Todo[], id: string): Todo[] =>
  todos.filter((todo) => todo.id !== id)

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setTodos(await api.fetchTodos())
    } catch (e) {
      setError(messageOf(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Runs a mutation; reports errors via state and returns whether it succeeded.
  const run = useCallback(async (action: () => Promise<void>) => {
    setError(null)
    try {
      await action()
      return true
    } catch (e) {
      setError(messageOf(e))
      return false
    }
  }, [])

  const add = (title: string) =>
    run(async () => {
      const created = await api.createTodo(title)
      setTodos((current) => [...current, created])
    })

  const update = (id: string, changes: UpdateTodoInput) =>
    run(async () => {
      const updated = await api.updateTodo(id, changes)
      setTodos((current) => replaceTodo(current, updated))
    })

  const remove = (id: string) =>
    run(async () => {
      await api.deleteTodo(id)
      setTodos((current) => withoutTodo(current, id))
    })

  return {
    todos,
    visibleTodos: filterTodos(todos, filter),
    activeCount: todos.filter((todo) => !todo.completed).length,
    isLoading,
    error,
    filter,
    setFilter,
    reload: load,
    add,
    update,
    remove,
  }
}
