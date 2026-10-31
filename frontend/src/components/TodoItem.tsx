import { useState, type SubmitEvent } from "react"
import { MAX_TITLE_LENGTH, type Todo } from "@todo/shared"

type TodoItemProps = {
  todo: Todo
  onToggle: (todo: Todo) => void
  onRename: (todo: Todo, title: string) => Promise<boolean>
  onDelete: (todo: Todo) => void
}

export const TodoItem = ({
  todo,
  onToggle,
  onRename,
  onDelete,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  const startEditing = () => {
    setDraft(todo.title)
    setIsEditing(true)
  }

  const handleSave = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.trim() === "") return
    if (await onRename(todo, draft)) setIsEditing(false)
  }

  if (isEditing) {
    return (
      <li className="py-2">
        <form onSubmit={(e) => void handleSave(e)} className="flex gap-2">
          <label htmlFor={`edit-${todo.id}`} className="sr-only">
            Edit title
          </label>
          <input
            id={`edit-${todo.id}`}
            value={draft}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => {
              setDraft(e.target.value)
            }}
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
          />
          <button type="submit" className="rounded bg-blue-700 px-3 text-white">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
            }}
            className="rounded border border-slate-300 px-3 dark:border-slate-600"
          >
            Cancel
          </button>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 py-2">
      <input
        id={`toggle-${todo.id}`}
        type="checkbox"
        checked={todo.completed}
        onChange={() => {
          onToggle(todo)
        }}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
        className="size-5"
      />
      <span
        className={`flex-1 break-words ${todo.completed ? "text-slate-500 line-through dark:text-slate-400" : ""}`}
      >
        {todo.title}
      </span>
      <button
        type="button"
        onClick={startEditing}
        aria-label={`Edit "${todo.title}"`}
        className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          onDelete(todo)
        }}
        aria-label={`Delete "${todo.title}"`}
        className="rounded border border-red-700 px-2 py-1 text-red-700 dark:border-red-400 dark:text-red-400"
      >
        Delete
      </button>
    </li>
  )
}
