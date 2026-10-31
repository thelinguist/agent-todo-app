import { useCallback, useEffect, useState } from "react"
import type { Todo, UpdateTodoInput } from "@todo/shared"
import * as api from "../api/todos"

const toMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong"

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setTodos(await api.listTodos())
      setError(null)
    } catch (err) {
      setError(toMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reload = useCallback(async () => {
    setIsLoading(true)
    await load()
  }, [load])

  useEffect(() => {
    let isCancelled = false
    api
      .listTodos()
      .then((loaded) => {
        if (!isCancelled) setTodos(loaded)
      })
      .catch((err: unknown) => {
        if (!isCancelled) setError(toMessage(err))
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })
    return () => {
      isCancelled = true
    }
  }, [])

  // Runs a mutation, surfacing failures through `error`. Returns whether it succeeded.
  const mutate = useCallback(
    async (action: () => Promise<void>): Promise<boolean> => {
      try {
        await action()
        setError(null)
        return true
      } catch (err) {
        setError(toMessage(err))
        return false
      }
    },
    [],
  )

  const add = (title: string) =>
    mutate(async () => {
      const created = await api.createTodo(title)
      setTodos((prev) => [...prev, created])
    })

  const update = (id: string, changes: UpdateTodoInput) =>
    mutate(async () => {
      const updated = await api.updateTodo(id, changes)
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    })

  const remove = (id: string) =>
    mutate(async () => {
      await api.deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    })

  return { todos, isLoading, error, reload, add, update, remove }
}
