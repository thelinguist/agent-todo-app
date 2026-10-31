import { useState, type SyntheticEvent } from "react"
import { MAX_TITLE_LENGTH } from "@todo/shared"

type Props = { onAdd: (title: string) => Promise<boolean> }

export const TodoForm = ({ onAdd }: Props) => {
  const [title, setTitle] = useState("")

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    if (title.trim() === "") return
    if (await onAdd(title)) setTitle("")
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
      <label htmlFor="new-todo" className="sr-only">
        New todo
      </label>
      <input
        id="new-todo"
        value={title}
        maxLength={MAX_TITLE_LENGTH}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded border border-slate-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
      >
        Add
      </button>
    </form>
  )
}
