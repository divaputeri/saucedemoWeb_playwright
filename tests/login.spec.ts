import { test, expect } from '@playwright/test';

test('login success shows products', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByText('Products')).toBeVisible();
});

test('invalid login shows error', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('random_user');
  await page.locator('[data-test="password"]').fill('wrong_pass');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  const error = page.locator('[data-test="error"], .error-message-container');
  await expect(error).toBeVisible();
});
