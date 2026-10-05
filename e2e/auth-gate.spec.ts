import { expect, test } from '@playwright/test'

// The mode switcher is a tablist and the form has its own submit button with the same label,
// so tabs are selected by role and the submit button is scoped to the form.
test.describe('sikumit entry', () => {
  test('unauthenticated visitor sees the auth form', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'סיכומית' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'כניסה' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'הרשמה' })).toBeVisible()
    await expect(page.getByLabel('אימייל')).toBeVisible()
    await expect(page.getByLabel('סיסמה')).toBeVisible()
    await expect(page.locator('form').getByRole('button', { name: 'כניסה' })).toBeVisible()
  })

  test('switches between sign-in and sign-up modes', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('tab', { name: 'כניסה' })).toHaveAttribute('aria-selected', 'true')
    await page.getByRole('tab', { name: 'הרשמה' }).click()
    await expect(page.getByRole('tab', { name: 'הרשמה' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tab', { name: 'כניסה' })).toHaveAttribute('aria-selected', 'false')
    await expect(page.locator('form').getByRole('button', { name: 'הרשמה' })).toBeVisible()
  })
})
