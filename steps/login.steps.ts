import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page, restartApp } from '../support/hooks';

const BASE = 'https://www.saucedemo.com/v1/';

Given('I am on the app login screen', async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await expect(page.locator('[data-test="password"]')).toBeVisible();
});

When('I login with {string} and {string}', async (username: string, password: string) => {
  await page.locator('[data-test="username"]').fill(username ?? '');
  await page.locator('[data-test="password"]').fill(password ?? '');
  await page.getByRole('button', { name: 'LOGIN' }).click();
});

Then('I should see the products screen', async () => {
  await expect(page.getByText('Products')).toBeVisible();
  await expect(page).toHaveURL(/\/v1\/inventory\.html/);
});

Then('I should see an error message', async () => {
  const error = page.locator('[data-test="error"], .error-message-container');
  await expect(error).toBeVisible();
});

When('I restart the app', async () => {
  await restartApp();
});

Then('I should see the login screen', async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await expect(page.locator('[data-test="password"]')).toBeVisible();
  await expect(page).toHaveURL(/\/v1\/(index\.html)?$/);
});

When('I open the menu', async () => {
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});

When('I logout', async () => {
  await page.getByRole('link', { name: 'Logout' }).click();
});

When('I navigate to About', async () => {
  await page.getByRole('link', { name: 'About' }).click();
})

Then('I should be on the About page', async () => {
  await expect(page).toHaveURL(/saucelabs\.com/i);
});

Then('the products screen should render within {int} ms', async (ms: number) => {
  const start = Date.now();
  const deadline = start + ms;
  await expect(page).toHaveURL(/\/v1\/inventory\.html/, { timeout: ms });
  const timeoutLeft = Math.max(1, deadline - Date.now());
  const header = page.locator('.product_label, .header_secondary_container .title, [data-test="title"]');
  await expect(header).toBeVisible({ timeout: timeoutLeft });
  await expect(header).toHaveText(/^\s*products\s*$/i);

  const elapsed = Date.now() - start;
  if (elapsed > ms) throw new Error(`Rendered in ${elapsed}ms (SLA ${ms}ms)`);
});