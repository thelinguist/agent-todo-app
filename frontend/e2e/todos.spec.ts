import { expect, test } from "@playwright/test"

// Unique titles keep tests independent of data left on a deployed server.
const uniqueTitle = (label: string) => `${label} ${Date.now()}`

test("add, complete, filter, edit and delete a todo", async ({ page }) => {
  const title = uniqueTitle("e2e")
  await page.goto("/")

  await page.getByLabel("New todo").fill(title)
  await page.getByLabel("New todo").press("Enter")
  await expect(page.getByText(title, { exact: true })).toBeVisible()

  await page
    .getByRole("checkbox", { name: `Mark "${title}" as complete` })
    .click()
  await page.getByRole("button", { name: "Active" }).click()
  await expect(page.getByText(title, { exact: true })).toBeHidden()
  await page.getByRole("button", { name: "Completed" }).click()
  await expect(page.getByText(title, { exact: true })).toBeVisible()

  await page.getByRole("button", { name: `Edit "${title}"` }).click()
  const renamed = `${title} renamed`
  await page.getByLabel("Edit title").fill(renamed)
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText(renamed, { exact: true })).toBeVisible()

  await page.getByRole("button", { name: `Delete "${renamed}"` }).click()
  await expect(page.getByText(renamed, { exact: true })).toBeHidden()
})
