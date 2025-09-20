import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from '../support/hooks';

const BASE = 'https://www.saucedemo.com/v1/'
let lastClickedName: string | null = null
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function ensureLoggedIn(username: string, password: string) {
  if (page.url().includes('/inventory.html')) return;

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-test="username"]').fill(username ?? '');
  await page.locator('[data-test="password"]').fill(password ?? '');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(/\/v1\/inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
}

async function ensureOnProducts() {
  if (!page.url().includes('/inventory.html')) {
    await page.goto(`${BASE}inventory.html`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Products')).toBeVisible();
}

Given('I am logged in as {string} with {string}', async (username: string, password: string) => {
  await ensureLoggedIn(username, password);
});


Given('I am on the products screen', async () => {
  await ensureOnProducts();
});

When('I add {int} products to cart', async (n: number) => {
  if (!page.url().includes('/inventory.html')) {
    await page.goto(`${BASE}inventory.html`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Products')).toBeVisible();

  const cards = page.locator('.inventory_list .inventory_item');
  const total = await cards.count();
  const target = Math.min(n, total);

  for (let i = 0; i < target; i++) {
    const card = cards.nth(i);
    const addBtn = card.getByRole('button', { name: /add to cart/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }
  }
});

Then(/^the cart badge should\s+(not\s+)?show\s+"([^"]+)"$/i, async (neg: string | undefined, count: string) => {
  const badge = page.locator('.shopping_cart_badge');
  const isVisible = await badge.isVisible().catch(() => false);

  if (neg) {
    if (!isVisible) return; 
    await expect(badge).not.toHaveText(count);
  } else {
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(count);
  }
});

When('I remove {int} products from outside cart', async (n: number) => {
  if (!page.url().includes('/inventory.html')) {
    await page.goto(`${BASE}inventory.html`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Products')).toBeVisible();
  const removeButtons = page
    .locator('button.btn_secondary.btn_inventory')               // v1 classes
    .or(page.getByRole('button', { name: /^remove$/i }));        // fallback by text

  let available = await removeButtons.count();
  if (available < n) {
    throw new Error(`Only ${available} removable item(s) available on products page, requested ${n}.`);
  }
  for (let i = 0; i < n; i++) {
    await removeButtons.first().click();
    await page.waitForTimeout(10);
  }
});

Then(/^the cart badge should (not )?be visible$/, async (neg?: string) => {
  const badge = page.locator('.shopping_cart_badge');
  if (neg) {
    await expect(badge).toBeHidden({ timeout: 1500 });
  } else {
    await expect(badge).toBeVisible();
  }
});

When('I open the cart', async () => {
  await page.locator('.shopping_cart_link').click();
  await expect(page).toHaveURL(/\/v1\/cart\.html/);
});

Then('I should see the product in the cart', async () => {
  await expect(page.locator('.cart_list .cart_item')).toHaveCount(1);
});

When('I remove the product from the cart page', async () => {
  const CartItem = page.locator('.cart_list .cart_item').first();
  await CartItem.getByRole('button', { name: /^remove$/i }).click();
});

Then('I should not see any product in the cart', async () => {
  await expect(page.locator('.cart_list .cart_item')).toHaveCount(0);
});

When('I continue shopping', async () => {
  await expect(page).toHaveURL(/\/v1\/cart\.html/);
  const cont = page.locator('a.btn_secondary', { hasText: /continue shopping/i });
  await expect(cont).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/v1\/inventory\.html/),
    cont.click()
  ]);
});

When('I add all products to cart', async () => {
  if (!page.url().includes('/inventory.html')) {
    await page.goto(`${BASE}inventory.html`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Products')).toBeVisible();

  const items = page.locator('.inventory_list .inventory_item');
  const total = await items.count();

  for (let i = 0; i < total; i++) {
    const item = items.nth(i);

    const addBtn = item.locator('button.btn_primary.btn_inventory')
      .or(item.getByRole('button', { name: /add to cart/i }));

    if (await addBtn.count()) {
      try {
        await addBtn.first().scrollIntoViewIfNeeded();
        await addBtn.first().click({ timeout: 1000 }).catch(() => {});
        
        const removeBtn = item.locator('button.btn_secondary.btn_inventory')
          .or(item.getByRole('button', { name: /^remove$/i }));
        await removeBtn.first().waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
      } catch {}
    }
  }
});

When('I remove all products from outside cart', async () => {
  if (!page.url().includes('/inventory.html')) {
    await page.goto(`${BASE}inventory.html`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Products')).toBeVisible();

  const items = page.locator('.inventory_list .inventory_item');
  const total = await items.count();
  for (let pass = 0; pass < 3; pass++) {
    let removedThisPass = 0;

    for (let i = 0; i < total; i++) {
      const btn = items.nth(i).locator('button.btn_inventory'); // satu-satunya tombol di kartu
      if (!(await btn.count())) continue;

      const label = (await btn.first().textContent())?.trim().toLowerCase();
      if (label === 'remove') {
        await btn.first().scrollIntoViewIfNeeded();
        await btn.first().click({ timeout: 1000 }).catch(() => {});
        removedThisPass++;
        await page.waitForTimeout(25); 
      }}
    if (removedThisPass === 0) break;
  }
});

When('I remove all products from inside cart', async () => {
  if (!page.url().includes('/cart.html')) {
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/\/v1\/cart\.html/);
  }
  const list = page.locator('.cart_list');
  const removeBtns = () =>
    list.getByRole('button', { name: /^remove$/i })
        .or(list.locator('button.cart_button', { hasText: /^remove$/i }));
 const maxAttempts = 12;
  let attempts = 0;
  while ((await removeBtns().count()) > 0 && attempts < maxAttempts) {
    await removeBtns().first().scrollIntoViewIfNeeded();
    await removeBtns().first().click({ timeout: 1000 }).catch(() => {});
    attempts++;
    await page.waitForTimeout(25); // beri waktu DOM update
  }
});

Then(/^there should\s+(not\s+)?be any "([^"]+)" buttons$/i,
  async (neg: string | undefined, label: string) => {
    const inCart = page.url().includes('/cart.html');
    const scope = inCart ? page.locator('.cart_list') : page.locator('.inventory_list');

    const buttons = scope.getByRole('button', { name: new RegExp(`^${esc(label)}$`, 'i') });

    if (neg) {
      await expect(buttons).toHaveCount(0);
    } else {
      expect(await buttons.count()).toBeGreaterThan(0);
    }
  }
);

function normalizePrices(texts: string[]): number[] {
  return texts.map(t =>
    parseFloat(t.replace(/[^\d.]/g, ''))
  );
}

function isAsc<T>(arr: T[], key?: (x: T) => any) {
  for (let i = 1; i < arr.length; i++) {
    const a = key ? key(arr[i - 1]) : (arr[i - 1] as any);
    const b = key ? key(arr[i]) : (arr[i] as any);
    if (a > b) return false;
  }
  return true;
}

function isDesc<T>(arr: T[], key?: (x: T) => any) {
  for (let i = 1; i < arr.length; i++) {
    const a = key ? key(arr[i - 1]) : (arr[i] as any);
    const b = key ? key(arr[i]) : (arr[i] as any);
    if (a < b) return false;
  }
  return true;
}

When(/^I sort products by (.+)$/, async (option: string) => {
  await ensureOnProducts();

  const byDataTest = page.locator('select[data-test="product_sort_container"]');
  const byClass = page.locator('select.product_sort_container');

  if (await byDataTest.count()) {
    await byDataTest.selectOption({ label: option });
  } else {
    await byClass.selectOption({ label: option });
  }

  await page.waitForTimeout(50);
});

Then(/^products should be sorted (.+)$/, async (order: string) => {
  await ensureOnProducts();

  const nameEls = page.locator('.inventory_item_name');
  const priceEls = page.locator('.inventory_item_price');

  const names = (await nameEls.allTextContents()).map(s => s.trim());
  const prices = normalizePrices(await priceEls.allTextContents());

  const o = order.toLowerCase().replace(/\s+/g, ' ');

  if (o.includes('a to z')) {
    expect(isAsc(names, s => s.toLowerCase())).toBeTruthy();
  } else if (o.includes('z to a')) {
    expect(isDesc(names, s => s.toLowerCase())).toBeTruthy();
  } else if (o.includes('low-high') || o.includes('low to high')) {
    expect(isAsc(prices)).toBeTruthy();
  } else if (o.includes('high-low') || o.includes('high to low')) {
    expect(isDesc(prices)).toBeTruthy();
  } else {
    throw new Error(`Unknown order '${order}'. Gunakan: "A to Z", "Z to A", "Price Low-High", atau "Price High-Low".`);
  }
});

When('I tap through all products', async () => {
  if (!page.url().includes('/inventory.html')) {
    await page.goto('https://www.saucedemo.com/v1/inventory.html', { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Products')).toBeVisible();

  const names = page.locator('.inventory_item_name');
  const total = await names.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    // simpan nama yang mau diklik
    lastClickedName = (await names.nth(i).textContent())?.trim() ?? '';
    await names.nth(i).click();
    await expect(page).toHaveURL(/\/v1\/inventory-item\.html/);

    const backBtn = page
      .locator('button.inventory_details_back_button')
      .or(page.getByRole('button', { name: /back to products|<-?\s*back/i }));

    // untuk item terakhir: stay di detail (jangan back)
    if (i < total - 1) {
      await expect(backBtn).toBeVisible();
      await Promise.all([
        page.waitForURL(/\/v1\/inventory\.html/),
        backBtn.click(),
      ]);
      await expect(page.getByText('Products')).toBeVisible();
    }
  }
});

Then(/^the last opened product title should\s+(not\s+)?match\s+the\s+clicked\s+name$/i,async (neg?: string) => {
  const detailName = (await page
    .locator('.inventory_details_name, [data-test="inventory-item-name"]')
    .textContent())?.trim() ?? '';

  const clicked = (lastClickedName ?? '').trim();

  if (!clicked) {
    throw new Error('No clicked product name recorded. Make sure to tap a product first.');
  }

  if (neg) {
    expect(detailName).not.toBe(clicked);
  } else {
    expect(detailName).toBe(clicked);
  }
});
