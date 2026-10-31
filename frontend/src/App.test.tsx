import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Todo } from "@todo/shared"
import { App } from "./App"

// Minimal in-memory fake of the backend, behind fetch.
let todos: Todo[]
let nextId: number
let failNext: boolean

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status })

const fakeFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (failNext) {
    failNext = false
    return Promise.resolve(json(500, { error: "Server exploded" }))
  }
  const url = typeof input === "string" ? input : ""
  const method = init?.method ?? "GET"
  const body: Record<string, unknown> =
    typeof init?.body === "string"
      ? (JSON.parse(init.body) as Record<string, unknown>) // test fake parsing own request
      : {}
  const id = url.split("/")[2]
  if (method === "GET") return Promise.resolve(json(200, todos))
  if (method === "POST") {
    const todo: Todo = {
      id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`,
      title: String(body["title"]).trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    todos.push(todo)
    return Promise.resolve(json(201, todo))
  }
  if (method === "PATCH") {
    todos = todos.map((t) => (t.id === id ? { ...t, ...body } : t))
    return Promise.resolve(
      json(
        200,
        todos.find((t) => t.id === id),
      ),
    )
  }
  todos = todos.filter((t) => t.id !== id)
  return Promise.resolve(json(204))
}

beforeEach(() => {
  todos = []
  nextId = 1
  failNext = false
  vi.spyOn(globalThis, "fetch").mockImplementation(fakeFetch)
})
afterEach(() => vi.restoreAllMocks())

const addTodo = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) => {
  await user.type(screen.getByLabelText("New todo"), `${title}{Enter}`)
  await screen.findByText(title)
}

describe("App", () => {
  it("shows loading, then the empty state", async () => {
    render(<App />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
    expect(screen.getByText("0 items left")).toBeInTheDocument()
  })

  it("adds a todo with Enter and clears the input", async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, "Buy milk")
    expect(screen.getByLabelText("New todo")).toHaveValue("")
    expect(screen.getByText("1 item left")).toBeInTheDocument()
  })

  it("ignores blank titles", async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText("No todos to show.")
    await user.type(screen.getByLabelText("New todo"), "   {Enter}")
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("toggles completion and filters", async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, "One")
    await addTodo(user, "Two")
    await user.click(screen.getByRole("checkbox", { name: "One" }))
    await waitFor(() =>
      expect(screen.getByText("1 item left")).toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: "Active" }))
    expect(screen.queryByText("One")).not.toBeInTheDocument()
    expect(screen.getByText("Two")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Completed" }))
    expect(screen.getByText("One")).toBeInTheDocument()
    expect(screen.queryByText("Two")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "All" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(2)

    await user.click(screen.getByRole("checkbox", { name: "One" }))
    await waitFor(() =>
      expect(screen.getByText("2 items left")).toBeInTheDocument(),
    )
  })

  it("edits a title and can cancel", async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, "Old")

    await user.click(screen.getByRole("button", { name: "Edit Old" }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByText("Old")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Edit Old" }))
    const input = screen.getByLabelText("Edit title")
    await user.clear(input)
    await user.type(input, "{Enter}")
    expect(screen.getByLabelText("Edit title")).toBeInTheDocument() // blank ignored

    await user.type(input, "New{Enter}")
    expect(await screen.findByText("New")).toBeInTheDocument()
    expect(screen.queryByLabelText("Edit title")).not.toBeInTheDocument()
  })

  it("deletes a todo", async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, "Gone")
    await user.click(screen.getByRole("button", { name: "Delete Gone" }))
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
  })

  it("shows an error when loading fails and retries", async () => {
    failNext = true
    const user = userEvent.setup()
    render(<App />)
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Server exploded")
    await user.click(within(alert).getByRole("button", { name: "Retry" }))
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("keeps the input and shows an error when adding fails", async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText("No todos to show.")
    failNext = true
    await user.type(screen.getByLabelText("New todo"), "Fails{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Server exploded",
    )
    expect(screen.getByLabelText("New todo")).toHaveValue("Fails")
  })

  it("uses a generic message for non-Error failures", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue("nope")
    render(<App />)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong",
    )
  })
})
