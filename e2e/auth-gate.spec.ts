import { expect, test } from '@playwright/test'

test.describe('sikumit entry', () => {
  test('unauthenticated visitor sees the auth form', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'סיכומית' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'כניסה' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'הרשמה' })).toBeVisible()
    await expect(page.getByLabel('אימייל')).toBeVisible()
    await expect(page.getByLabel('סיסמה')).toBeVisible()
  })

  test('switches between sign-in and sign-up modes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'הרשמה' }).click()
    await expect(page.getByRole('button', { name: 'הרשמה' })).toHaveClass(/bg-\[#183c35\]/)
  })
})
