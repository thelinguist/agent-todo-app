export const FILTERS = ["all", "active", "completed"] as const
export type Filter = (typeof FILTERS)[number]

const LABELS: Record<Filter, string> = {
  all: "All",
  active: "Active",
  completed: "Completed",
}

type FilterBarProps = { value: Filter; onChange: (filter: Filter) => void }

export const FilterBar = ({ value, onChange }: FilterBarProps) => (
  <nav aria-label="Filter todos" className="flex gap-2">
    {FILTERS.map((filter) => (
      <button
        key={filter}
        type="button"
        aria-pressed={value === filter}
        onClick={() => {
          onChange(filter)
        }}
        className={`rounded border px-3 py-1 ${value === filter ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 dark:border-slate-600"}`}
      >
        {LABELS[filter]}
      </button>
    ))}
  </nav>
)
