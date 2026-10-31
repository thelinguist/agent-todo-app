# Todo App — Spec

A basic single-user todo app: a React frontend talking to a Hono backend over a JSON API.

## Features

- List all todos
- Add a todo (title required, 1–200 characters after trimming)
- Edit a todo's title
- Mark a todo complete / incomplete
- Delete a todo
- Filter the list: All / Active / Completed
- Show a count of active todos

Out of scope: users and auth, persistence across server restarts, due dates, tags, drag-and-drop ordering.

## Repo Setup
Use bun.js and create a monorepo with at least:

```
/frontend   Vite + React + TypeScript
/backend    Hono on Node + TypeScript
```
These tools and other framework tools must be set up using their docs guidance, and not older versions!

Each folder is its own package with its own `package.json`.

## Backend (`/backend`)

- Hono running on Node via `@hono/node-server`, port `3000` (override with `PORT`).
- In-memory storage. Data resets when the server restarts.
- Validate request bodies; return `400` with `{ "error": "<message>" }` for invalid input.

### Data model

```ts
type Todo = {
  id: string;          // UUID
  title: string;
  completed: boolean;
  createdAt: string;   // ISO 8601
}
```

### API

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/todos` | none | `200` with `Todo[]`, oldest first |
| POST | `/todos` | `{ title }` | `201` with the created `Todo` |
| PATCH | `/todos/:id` | `{ title?, completed? }` | `200` with the updated `Todo` |
| DELETE | `/todos/:id` | none | `204` |

Unknown `id` returns `404` with `{ "error": "Todo not found" }`.

## Frontend (`/frontend`)

- Vite + React + TypeScript.
- In dev, proxy `/todos` to `http://localhost:3000` in `vite.config.ts` so the app calls relative URLs.
- Show loading and error states for API calls.
- Usable with the keyboard: Enter adds a todo, and all controls are focusable buttons or inputs.

## Scripts (required in both packages)
- testing: vitest. Frontend should also use `@testing-library/react`. Playwright tests should also exist
- linting: eslint with common best practices and also sonarqube scanner
- formatting: prettier with the only override: no semicolons

## Tests
- Coverage must be tracked and must be 90% or better.
- Playwright tests should execute against a local server but also a deployed version. Focus on happy path scenarios and critical functionality and let unit tests cover the rest (at least).

## Definition of done

- Every feature above works.
- checks pass, including in CI/CD
- Code follows `STANDARDS.md`.
- A root `README.md` explains how to install and run both parts.
