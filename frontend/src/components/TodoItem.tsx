import { useState, type SyntheticEvent } from "react"
import { MAX_TITLE_LENGTH, type Todo } from "@todo/shared"

type Props = {
  todo: Todo
  onToggle: (todo: Todo) => void
  onRename: (todo: Todo, title: string) => Promise<boolean>
  onDelete: (todo: Todo) => void
}

const buttonClass =
  "rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"

export const TodoItem = ({ todo, onToggle, onRename, onDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  const startEditing = () => {
    setDraft(todo.title)
    setIsEditing(true)
  }

  const handleSave = async (event: SyntheticEvent) => {
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
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-2 py-1"
          />
          <button type="submit" className={buttonClass}>
            Save
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setIsEditing(false)}
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
        type="checkbox"
        id={`toggle-${todo.id}`}
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        className="h-4 w-4"
      />
      <label
        htmlFor={`toggle-${todo.id}`}
        className={`flex-1 ${todo.completed ? "text-slate-400 line-through" : ""}`}
      >
        {todo.title}
      </label>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Edit ${todo.title}`}
        onClick={startEditing}
      >
        Edit
      </button>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Delete ${todo.title}`}
        onClick={() => onDelete(todo)}
      >
        Delete
      </button>
    </li>
  )
}
