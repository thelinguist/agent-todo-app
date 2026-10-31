import { useCallback, useEffect, useState } from "react"
import { z } from "zod"

export const THEME_STORAGE_KEY = "theme"
const themeSchema = z.enum(["light", "dark"])
export type Theme = z.infer<typeof themeSchema>

const readStoredTheme = (): Theme | null => {
  const parsed = themeSchema.safeParse(localStorage.getItem(THEME_STORAGE_KEY))
  return parsed.success ? parsed.data : null
}

const prefersDark = (): boolean =>
  window.matchMedia("(prefers-color-scheme: dark)").matches

export const getInitialTheme = (): Theme =>
  readStoredTheme() ?? (prefersDark() ? "dark" : "light")

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark"
    localStorage.setItem(THEME_STORAGE_KEY, next)
    setTheme(next)
  }, [theme])

  return { theme, toggleTheme }
}
