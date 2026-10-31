import { afterEach, describe, expect, it, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import * as api from "../api/todos"
import { useTodos } from "./use-todos"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useTodos", () => {
  it("falls back to a generic message for non-Error rejections", async () => {
    vi.spyOn(api, "listTodos").mockRejectedValue("nope")
    const { result } = renderHook(() => useTodos())
    await waitFor(() => {
      expect(result.current.error).toBe("Something went wrong")
    })
  })

  it("ignores results that arrive after unmount", async () => {
    const list = vi.spyOn(api, "listTodos")
    list.mockResolvedValueOnce([])
    const first = renderHook(() => useTodos())
    first.unmount()
    list.mockRejectedValueOnce(new Error("late"))
    const second = renderHook(() => useTodos())
    second.unmount()
    await Promise.resolve()
    expect(list).toHaveBeenCalledTimes(2)
  })
})
