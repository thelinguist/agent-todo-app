# Todo app

A single-user todo app: a React (Vite + Tailwind) frontend talking to a Hono backend over a JSON API. Data is stored in memory and resets when the backend restarts.

| Package     | Description                                  |
| ----------- | -------------------------------------------- |
| `frontend/` | Vite + React + TypeScript                    |
| `backend/`  | Hono on Node, in-memory store, Bruno API tests |
| `shared/`   | Zod schemas and types shared by both         |

## Install

Requires [Bun](https://bun.sh) and Node.js (current LTS).

```sh
bun install
```

## Run

Start both packages in dev mode (backend on `:3000`, frontend on `:5173` with `/todos` proxied to the backend):

```sh
bun run dev
```

Or run each separately: `bun run --cwd backend dev` and `bun run --cwd frontend dev`. Set `PORT` to change the backend port.

## Checks

From the root (each runs across all workspaces):

```sh
bun run format       # prettier --write
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test         # vitest with coverage (>= 90%)
bun run test:api     # Bruno API tests against the built backend
bun run test:e2e     # Playwright (see below)
```

### End-to-end tests

Install the browser once with `bunx playwright install --with-deps chromium` in `frontend/`. By default `test:e2e` starts the local backend and frontend. To test a deployed app, set `E2E_BASE_URL`:

```sh
E2E_BASE_URL=https://example.com bun run test:e2e
```

In CI the deployed run is enabled by setting the repository variable `E2E_DEPLOYED_URL`.
