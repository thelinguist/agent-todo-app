import { FilterBar } from "./components/FilterBar"
import { TodoForm } from "./components/TodoForm"
import { TodoList } from "./components/TodoList"
import { useTodos } from "./hooks/use-todos"

export const App = () => {
  const t = useTodos()

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-3xl font-bold">Todos</h1>
      <TodoForm onAdd={t.add} />
      {t.error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded bg-red-50 p-3 text-red-800"
        >
          <span>{t.error}</span>
          <button
            type="button"
            className="rounded px-2 py-1 underline"
            onClick={() => void t.reload()}
          >
            Retry
          </button>
        </div>
      )}
      {t.isLoading ? (
        <p role="status">Loading…</p>
      ) : (
        <TodoList
          todos={t.visibleTodos}
          onToggle={(todo) =>
            void t.update(todo.id, { completed: !todo.completed })
          }
          onRename={(todo, title) => t.update(todo.id, { title })}
          onDelete={(todo) => void t.remove(todo.id)}
        />
      )}
      <footer className="flex items-center justify-between">
        <p>
          {t.activeCount} {t.activeCount === 1 ? "item" : "items"} left
        </p>
        <FilterBar filter={t.filter} onChange={t.setFilter} />
      </footer>
    </main>
  )
}
