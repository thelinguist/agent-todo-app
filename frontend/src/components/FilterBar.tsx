import type { Filter } from "../hooks/use-todos"

type Props = { filter: Filter; onChange: (filter: Filter) => void }

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
]

export const FilterBar = ({ filter, onChange }: Props) => (
  <div role="group" aria-label="Filter todos" className="flex gap-2">
    {FILTERS.map(({ value, label }) => (
      <button
        key={value}
        type="button"
        aria-pressed={filter === value}
        onClick={() => onChange(value)}
        className={`rounded px-3 py-1 text-sm ${
          filter === value
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
)
