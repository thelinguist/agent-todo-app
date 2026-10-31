import { useState, type SubmitEvent } from "react"
import { MAX_TITLE_LENGTH } from "@todo/shared"

type TodoFormProps = { onAdd: (title: string) => Promise<boolean> }

export const TodoForm = ({ onAdd }: TodoFormProps) => {
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (title.trim() === "") return
    setIsSubmitting(true)
    const hasSucceeded = await onAdd(title)
    setIsSubmitting(false)
    if (hasSucceeded) setTitle("")
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
        onChange={(e) => {
          setTitle(e.target.value)
        }}
        placeholder="What needs doing?"
        className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  )
}
