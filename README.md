# Todo App

A single-user todo app: a React (Vite) frontend talking to a Hono backend over a JSON API. Data is stored in memory and resets when the server restarts.

```
/shared     Zod schemas and types shared by both packages
/backend    Hono on Node + TypeScript (port 3000, override with PORT)
/frontend   Vite + React + TypeScript + Tailwind
```

## Install

Requires [Bun](https://bun.sh) and Node 22+.

```sh
bun install
```

## Run

```sh
bun run dev                    # backend and frontend together
bun run --filter @todo/backend dev    # backend only, http://localhost:3000
bun run --filter @todo/frontend dev   # frontend only, http://localhost:5173
```

The Vite dev server proxies `/todos` to `http://localhost:3000`.

Production: `bun run build`, then `cd backend && bun run start`.

## Scripts

Run from the root (applies to every workspace) or inside a package.

| Script                    | Does                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `dev` / `build`           | Dev mode / production build                                |
| `lint`                    | ESLint (includes SonarJS rules), no warnings               |
| `format` / `format:check` | Prettier write / check                                     |
| `typecheck`               | `tsc --noEmit`                                             |
| `test`                    | Vitest with coverage (90% threshold enforced)              |
| `test:api`                | Bruno API tests against the built backend                  |
| `test:e2e`                | Playwright (needs `bunx playwright install chromium` once) |

`test:e2e` starts the backend and frontend locally by default. To test a deployed version, set `E2E_BASE_URL`:

```sh
E2E_BASE_URL=https://todo.example.com bun run test:e2e
```

`sonar-project.properties` is provided for running SonarQube Scanner against a server; the SonarJS rules also run locally through ESLint.

## API

| Method | Path         | Body                     | Success        |
| ------ | ------------ | ------------------------ | -------------- |
| GET    | `/todos`     | –                        | `200` `Todo[]` |
| POST   | `/todos`     | `{ title }`              | `201` `Todo`   |
| PATCH  | `/todos/:id` | `{ title?, completed? }` | `200` `Todo`   |
| DELETE | `/todos/:id` | –                        | `204`          |

Errors are `{ "error": "..." }` with `400` (invalid input) or `404` (unknown id).
