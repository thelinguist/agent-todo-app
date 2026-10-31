import { useState } from "react"
import type { Todo } from "@todo/shared"
import { useTodos } from "./hooks/use-todos"
import { FilterBar, type Filter } from "./components/FilterBar"
import { TodoForm } from "./components/TodoForm"
import { TodoList } from "./components/TodoList"
import { ThemeToggle } from "./components/ThemeToggle"
import { useTheme } from "./hooks/use-theme"

const matchesFilter = (todo: Todo, filter: Filter): boolean => {
  if (filter === "active") return !todo.completed
  if (filter === "completed") return todo.completed
  return true
}

export const App = () => {
  const { todos, isLoading, error, reload, add, update, remove } = useTodos()
  const [filter, setFilter] = useState<Filter>("all")
  const { theme, toggleTheme } = useTheme()

  const activeCount = todos.filter((t) => !t.completed).length
  const visible = todos.filter((t) => matchesFilter(t, filter))

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Todos</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      <TodoForm onAdd={add} />
      {error !== null ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded border border-red-700 bg-red-50 p-3 text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-200"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void reload()}
            className="rounded border border-red-700 px-2 py-1 dark:border-red-400"
          >
            Retry
          </button>
        </div>
      ) : null}
      {isLoading ? (
        <p role="status">Loading…</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <FilterBar value={filter} onChange={setFilter} />
            <p aria-live="polite">
              {activeCount} {activeCount === 1 ? "item" : "items"} left
            </p>
          </div>
          <TodoList
            todos={visible}
            onToggle={(t) => void update(t.id, { completed: !t.completed })}
            onRename={(t, title) => update(t.id, { title })}
            onDelete={(t) => void remove(t.id)}
          />
        </>
      )}
    </main>
  )
}
