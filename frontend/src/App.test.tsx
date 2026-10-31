import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Todo } from "@todo/shared"
import { App } from "./App"

let todos: Todo[]
let shouldFail: boolean

const json = (body: unknown, status = 200) => Response.json(body, { status })

const handle = (url: string, init?: RequestInit): Response => {
  if (shouldFail) return json({ error: "Boom" }, 500)
  const method = init?.method ?? "GET"
  const id = url.split("/")[2]
  const body: Record<string, unknown> =
    typeof init?.body === "string"
      ? (JSON.parse(init.body) as Record<string, unknown>) // test double parsing its own request
      : {}
  if (method === "POST") {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: String(body["title"]).trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    todos.push(todo)
    return json(todo, 201)
  }
  if (method === "PATCH") {
    const index = todos.findIndex((t) => t.id === id)
    const next = { ...todos[index], ...body } as Todo // test double merge
    todos[index] = next
    return json(next)
  }
  if (method === "DELETE") {
    todos = todos.filter((t) => t.id !== id)
    return new Response(null, { status: 204 })
  }
  return json(todos)
}

const seed = (title: string, completed = false): Todo => ({
  id: crypto.randomUUID(),
  title,
  completed,
  createdAt: new Date().toISOString(),
})

beforeEach(() => {
  todos = []
  shouldFail = false
  localStorage.clear()
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) =>
      Promise.resolve(handle(url, init)),
    ),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("App", () => {
  it("shows loading then the empty state", async () => {
    render(<App />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
    expect(screen.getByText("0 items left")).toBeInTheDocument()
  })

  it("lists existing todos", async () => {
    todos = [seed("one"), seed("two", true)]
    render(<App />)
    expect(await screen.findByText("one")).toBeInTheDocument()
    expect(screen.getByText("1 item left")).toBeInTheDocument()
  })

  it("adds a todo with Enter and clears the input", async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText("No todos to show.")
    await user.type(screen.getByLabelText("New todo"), "buy milk{Enter}")
    expect(await screen.findByText("buy milk")).toBeInTheDocument()
    expect(screen.getByLabelText("New todo")).toHaveValue("")
  })

  it("ignores blank titles", async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText("No todos to show.")
    await user.type(screen.getByLabelText("New todo"), "   {Enter}")
    expect(screen.getByText("No todos to show.")).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("toggles completion and filters", async () => {
    todos = [seed("one"), seed("two", true)]
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText("one")

    await user.click(screen.getByRole("button", { name: "Completed" }))
    expect(screen.queryByText("one")).not.toBeInTheDocument()
    expect(screen.getByText("two")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Active" }))
    expect(screen.getByText("one")).toBeInTheDocument()
    expect(screen.queryByText("two")).not.toBeInTheDocument()

    await user.click(screen.getByRole("checkbox", { name: /one/ }))
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
    expect(screen.getByText("0 items left")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "All" }))
    await user.click(screen.getByRole("checkbox", { name: /two/ }))
    expect(await screen.findByText("1 item left")).toBeInTheDocument()
  })

  it("edits a title and can cancel", async () => {
    todos = [seed("old")]
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole("button", { name: /Edit "old"/ }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByText("old")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Edit "old"/ }))
    const input = screen.getByLabelText("Edit title")
    await user.clear(input)
    await user.type(input, "new{Enter}")
    expect(await screen.findByText("new")).toBeInTheDocument()
  })

  it("does not save a blank edit", async () => {
    todos = [seed("keep")]
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole("button", { name: /Edit/ }))
    await user.clear(screen.getByLabelText("Edit title"))
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(screen.getByLabelText("Edit title")).toBeInTheDocument()
  })

  it("deletes a todo", async () => {
    todos = [seed("gone")]
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole("button", { name: /Delete/ }))
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
  })

  it("shows an error with retry when loading fails", async () => {
    shouldFail = true
    const user = userEvent.setup()
    render(<App />)
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Boom")
    shouldFail = false
    todos = [seed("recovered")]
    await user.click(within(alert).getByRole("button", { name: "Retry" }))
    expect(await screen.findByText("recovered")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("keeps the input and shows an error when adding fails", async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText("No todos to show.")
    shouldFail = true
    await user.type(screen.getByLabelText("New todo"), "x{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("Boom")
    expect(screen.getByLabelText("New todo")).toHaveValue("x")
  })

  it("reports network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("nope"))),
    )
    render(<App />)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server",
    )
  })

  it("switches to dark mode with the toggle", async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole("button", { name: "Dark mode" })
    expect(toggle).toHaveAttribute("aria-pressed", "false")
    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "true")
    expect(document.documentElement).toHaveClass("dark")
    await user.click(toggle)
    expect(document.documentElement).not.toHaveClass("dark")
    expect(await screen.findByText("No todos to show.")).toBeInTheDocument()
  })

  it("stays in edit mode when renaming fails", async () => {
    todos = [seed("old")]
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole("button", { name: /Edit/ }))
    shouldFail = true
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Boom")
    expect(screen.getByLabelText("Edit title")).toBeInTheDocument()
  })
})
