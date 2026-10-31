# Coding Standards

How code in this repo is written. `SPEC.md` says what to build; this file says how.

## Tooling

- **Package manager and workspaces:** Bun. A root `package.json` defines the workspaces; commit `bun.lock`.
- **Language:** TypeScript everywhere, `strict: true`. Also enable `noUncheckedIndexedAccess` and `noImplicitOverride`.
- **Formatting:** Prettier with defaults except `semi: false`. One shared config at the repo root.
- **Linting:** ESLint (flat config, `eslint.config.js`) with:
  - `typescript-eslint` recommended type-checked rules
  - `eslint-plugin-sonarjs` (SonarQube's rules, run locally)
  - `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` in `/frontend`
  - `eslint-config-prettier` last, so ESLint never fights Prettier
- **Tests:** Vitest for unit and integration tests, `@testing-library/react` for components, Playwright for end-to-end.

## Scripts

Every package defines these, and the root runs each across all workspaces:

| Script | Does |
|---|---|
| `dev` | Start in dev mode |
| `build` | Production build |
| `lint` | ESLint, zero errors and zero warnings |
| `format` | Prettier write |
| `format:check` | Prettier check (used by CI) |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest, run once with coverage |
| `test:e2e` | Playwright (root or `/frontend`). Base URL from `E2E_BASE_URL`, defaulting to the local server |

All scripts must run non-interactively, because CI and the agent run them unattended.

## TypeScript

- No `any`. Use `unknown` and narrow it.
- No non-null assertions (`!`) or `as` casts, except at boundaries (parsing input) with a comment explaining why.
- Prefer `type` over `interface` unless declaration merging is needed.
- Validate all external input (request bodies, API responses, env vars) at the boundary with a schema library (Zod), and derive types from the schemas.
- Share API types between packages through a small workspace package (e.g. `/shared`) rather than copying them.

## Naming and structure

- Files: `kebab-case.ts`. React component files: `PascalCase.tsx`, one component per file.
- Variables and functions: `camelCase`. Types and components: `PascalCase`. Constants that never change: `UPPER_SNAKE_CASE`.
- Booleans read as questions: `isLoading`, `hasError`, `completed`.
- Named exports only, except where a tool requires a default export (e.g. config files).
- Keep functions small and single-purpose. A function longer than about 40 lines is a signal to split it.
- Colocate tests with the code: `todo-store.ts` sits next to `todo-store.test.ts`.

## Backend (Hono)

- Group routes by resource (`routes/todos.ts`). Keep `index.ts` limited to wiring the app and starting the server.
- Keep storage behind a small interface (e.g. `TodoStore`), so swapping in-memory storage for a database doesn't touch route code.
- Use Hono's validator middleware with Zod for request bodies and params.
- One error handler (`app.onError`) produces the `{ "error": "..." }` shape. Routes throw or return typed errors; they don't format error responses themselves.
- Read config such as `PORT` from env in one place, validated at startup.

## Frontend (React)

- Function components and hooks only.
- Keep API calls in one module (e.g. `api/todos.ts`). Components never call `fetch` directly.
- Keep state as local as possible. Lift it only when siblings need it. No state library unless the spec grows to need one.
- utilize hooks for complex state management (or context for shared state) to keep components focused
- Every async UI handles loading, error and empty states.
- Accessibility:
  - Use semantic elements (`button`, `form`, `label`, `ul`).
  - Every input has a label.
  - Never use a clickable `div`.
- Styling: use tailwind css. Avoid custom css code as much as possible

## Testing
Follow the Testing Pyramid:
1. unit tests: vitest
2. API tests: bruno
3. E2E tests: playwright

- Unit Test coverage of **90% or more** for lines, branches, functions and statements in each package, enforced by Vitest's `coverage.thresholds` so `test` fails below it.
- Test behavior, not implementation:
  - React tests query by role or label text, never by class name or test ID unless there's no accessible alternative.
    - use `screen.debug()` to look for roles/labels if it's not immediately apparent before you revert to testID
  - Backend tests call routes through `app.request()`. No real network.
- Each test is independent: reset in-memory state between tests, and no ordering dependencies.
- Playwright covers happy paths and critical flows only: add, complete, filter, delete. Unit tests cover edge cases.
- No `.only` or `.skip` committed.
- API tests should cover at least one request example per endpoint

## Errors and logging

- Never swallow errors. Handle them, or let them reach the error handler.
- No `console.log` left in committed code. The backend may log through one small logger module. Log in a well defined pattern and frequently for easy debugging.

## Git

- Semantic commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`.
- One topic per PR.
- Run `format`, `lint`, `typecheck` and `test` before every commit.

## CI
- execute linting, formatting, building, and testing before a PR can be merged
- when a PR is merged, run the build script

