import { defineConfig } from "@playwright/test"

const LOCAL_URL = "http://localhost:5173"
const baseURL = process.env["E2E_BASE_URL"] ?? LOCAL_URL
const isLocal = baseURL === LOCAL_URL

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: { baseURL },
  // Only start local servers when testing locally; a deployed URL is used as-is.
  webServer: isLocal
    ? [
        {
          command: "bun run --cwd ../backend dev",
          url: "http://localhost:3000/todos",
          reuseExistingServer: !process.env["CI"],
        },
        {
          command: "bun run dev",
          url: LOCAL_URL,
          reuseExistingServer: !process.env["CI"],
        },
      ]
    : undefined,
})
