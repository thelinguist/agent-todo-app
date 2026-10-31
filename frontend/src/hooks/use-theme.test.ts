import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { THEME_STORAGE_KEY, useTheme } from "./use-theme"

const mockSystemDark = (isDark: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: isDark && query === "(prefers-color-scheme: dark)",
    })),
  )
}

const isDarkClassSet = () => document.documentElement.classList.contains("dark")

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("dark")
  mockSystemDark(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useTheme", () => {
  it("defaults to light when the system prefers light", () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("light")
    expect(isDarkClassSet()).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe("light")
  })

  it("follows a dark system preference", () => {
    mockSystemDark(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("dark")
    expect(isDarkClassSet()).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("prefers a stored choice over the system preference", () => {
    mockSystemDark(true)
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("light")
  })

  it("ignores an invalid stored value", () => {
    mockSystemDark(true)
    localStorage.setItem(THEME_STORAGE_KEY, "purple")
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("dark")
  })

  it("toggles the theme and remembers the choice", () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe("dark")
    expect(isDarkClassSet()).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe("light")
    expect(isDarkClassSet()).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
  })
})
