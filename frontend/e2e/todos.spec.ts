import { expect, test } from "@playwright/test"

const unique = () => `todo-${Date.now()}-${process.hrtime.bigint()}`

test("add, complete, filter, edit and delete a todo", async ({ page }) => {
  const title = unique()
  const renamed = `${title}-renamed`
  await page.goto("/")

  await page.getByLabel("New todo").fill(title)
  await page.getByLabel("New todo").press("Enter")
  const item = page.getByRole("listitem").filter({ hasText: title })
  await expect(item).toBeVisible()

  await item.getByRole("checkbox").click()
  await expect(item.getByRole("checkbox")).toBeChecked()
  await page.getByRole("button", { name: "Active" }).click()
  await expect(page.getByText(title, { exact: true })).toHaveCount(0)
  await page.getByRole("button", { name: "Completed" }).click()
  await expect(page.getByText(title, { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "All" }).click()

  await page.getByRole("button", { name: `Edit ${title}` }).click()
  await page.getByLabel("Edit title").fill(renamed)
  await page.getByLabel("Edit title").press("Enter")
  await expect(page.getByText(renamed, { exact: true })).toBeVisible()

  await page.getByRole("button", { name: `Delete ${renamed}` }).click()
  await expect(page.getByText(renamed, { exact: true })).toHaveCount(0)
})
