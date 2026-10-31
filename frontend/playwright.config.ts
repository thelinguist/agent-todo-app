import { defineConfig } from "@playwright/test"

const externalUrl = process.env["E2E_BASE_URL"]
const localUrl = "http://localhost:5173"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: externalUrl ?? localUrl, trace: "retain-on-failure" },
  // Without E2E_BASE_URL, start the backend and the Vite dev server locally.
  webServer: externalUrl
    ? undefined
    : [
        {
          command: "bun run dev",
          cwd: "../backend",
          url: "http://localhost:3000/todos",
          reuseExistingServer: !process.env["CI"],
        },
        {
          command: "bun run dev -- --port 5173 --strictPort",
          url: localUrl,
          reuseExistingServer: !process.env["CI"],
        },
      ],
})
