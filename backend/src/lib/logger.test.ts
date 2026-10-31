import { afterEach, describe, expect, it, vi } from "vitest"
import { logger } from "./logger"

afterEach(() => vi.restoreAllMocks())

describe("logger", () => {
  it("writes info to stdout with context", () => {
    const out = vi.spyOn(process.stdout, "write").mockReturnValue(true)
    logger.info("hello", { a: 1 })
    expect(out).toHaveBeenCalledWith(
      expect.stringMatching(/INFO hello \{"a":1\}\n$/),
    )
  })
  it("writes warn and error to stderr", () => {
    const err = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    logger.warn("w")
    logger.error("e")
    expect(err).toHaveBeenCalledTimes(2)
  })
})
