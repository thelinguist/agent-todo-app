import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { logger } from "./logger"

const NOW = new Date("2026-01-02T03:04:05.000Z")

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("logger", () => {
  it("writes info to stdout with context", () => {
    const out = vi.spyOn(process.stdout, "write").mockReturnValue(true)
    const err = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    logger.info("hello", { a: 1 })
    expect(out).toHaveBeenCalledWith(
      '2026-01-02T03:04:05.000Z INFO hello {"a":1}\n',
    )
    expect(err).not.toHaveBeenCalled()
  })
  it("omits context when none is given", () => {
    const out = vi.spyOn(process.stdout, "write").mockReturnValue(true)
    logger.info("plain")
    expect(out).toHaveBeenCalledWith("2026-01-02T03:04:05.000Z INFO plain\n")
  })
  it("writes warn and error to stderr", () => {
    const out = vi.spyOn(process.stdout, "write").mockReturnValue(true)
    const err = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    logger.warn("w")
    logger.error("e")
    expect(err).toHaveBeenNthCalledWith(1, "2026-01-02T03:04:05.000Z WARN w\n")
    expect(err).toHaveBeenNthCalledWith(2, "2026-01-02T03:04:05.000Z ERROR e\n")
    expect(out).not.toHaveBeenCalled()
  })
})
