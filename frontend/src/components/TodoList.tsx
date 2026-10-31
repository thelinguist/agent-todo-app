import type { Todo } from "@todo/shared"
import { TodoItem } from "./TodoItem"

type Props = {
  todos: Todo[]
  onToggle: (todo: Todo) => void
  onRename: (todo: Todo, title: string) => Promise<boolean>
  onDelete: (todo: Todo) => void
}

export const TodoList = ({ todos, ...handlers }: Props) => {
  if (todos.length === 0) {
    return <p className="py-4 text-center text-slate-500">No todos to show.</p>
  }
  return (
    <ul className="divide-y divide-slate-200">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} {...handlers} />
      ))}
    </ul>
  )
}
