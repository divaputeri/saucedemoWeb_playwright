import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from '../support/hooks';

const BASE = 'https://www.saucedemo.com/v1/';


When('I proceed to checkout', async () => {
  await expect(page).toHaveURL(/\/v1\/cart\.html/);
  const checkout = page.locator('a.btn_action.checkout_button', { hasText: /^checkout$/i });
  await expect(checkout).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/v1\/checkout-step-one\.html/),
    checkout.click(),
  ]);
});

When('I enter checkout info {string} {string} {string}', async (first: string, last: string, zip: string) => {
  const firstName = page.locator('#first-name, input[placeholder="First Name"]');
  const lastName  = page.locator('#last-name, input[placeholder="Last Name"]');
  const postal    = page.locator('#postal-code, input[placeholder="Postal Code"]');

  await expect(firstName).toBeVisible();
  await firstName.fill(first ?? '');
  await lastName.fill(last ?? '');
  await postal.fill(zip ?? '');
});

When('I continue checkout', async () => {
  const cont = page.getByRole('button', { name: /^continue$/i }).or(page.locator('#continue'));
  await cont.click();
});

Then('I should see checkout error {string}', async (msg: string) => {
  const err = page.locator('[data-test="error"], .error-message-container');
  await expect(err).toBeVisible();
  const text = (await err.textContent()) ?? '';
  expect(text.toLowerCase()).toContain(msg.toLowerCase());
});

When('I cancel checkout', async () => {
  const cancelBtn = page.locator('a.cart_cancel_link.btn_secondary', { hasText: /^cancel$/i });
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
  if (page.url().includes('/cart.html')) {
    const cont = page.locator('a.btn_secondary', { hasText: /continue shopping/i });
    if (await cont.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/v1\/inventory\.html/),
        cont.click(),
      ]);
    }
  }
});

Then('I should be on the checkout overview', async () => {
  await expect(page).toHaveURL(/\/v1\/checkout-step-two\.html/);
  await expect(page.locator('.summary_info')).toBeVisible();
});

Then('the overview should list {int} items', async (n: number) => {
  await expect(page).toHaveURL(/\/v1\/checkout-step-two\.html/);
  await expect(page.locator('.cart_list .cart_item')).toHaveCount(n);
});

When('I finish checkout', async () => {
  const finish = page.locator('a.btn_action.cart_button', { hasText: /^finish$/i });
  await Promise.all([
    page.waitForURL(/\/v1\/checkout-complete\.html/),
    finish.click(),
  ]);
});

Then('I should see the order complete screen', async () => {
  await expect(page).toHaveURL(/\/v1\/checkout-complete\.html/);
  await expect(page.getByText(/thank you for your order/i)).toBeVisible();
});
