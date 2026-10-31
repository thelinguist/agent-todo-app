import { defineConfig } from "@playwright/test"

const LOCAL_URL = "http://localhost:5173"
const baseURL = process.env["E2E_BASE_URL"] ?? LOCAL_URL
const E2E_DB_FILE = "/tmp/todo-e2e.db"
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
          // Fresh throwaway database per run so tests never see real data.
          command: `rm -f ${E2E_DB_FILE} && bun run --cwd ../backend dev`,
          env: { DATABASE_URL: `file:${E2E_DB_FILE}` },
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
