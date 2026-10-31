import type { Theme } from "../hooks/use-theme"

type ThemeToggleProps = { theme: Theme; onToggle: () => void }

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button
    type="button"
    aria-pressed={theme === "dark"}
    onClick={onToggle}
    className="rounded border border-slate-300 px-3 py-1 dark:border-slate-600"
  >
    Dark mode
  </button>
)
