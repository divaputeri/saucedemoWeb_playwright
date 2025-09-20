// support/hooks.ts
import {
  BeforeAll, AfterAll, Before, After, setDefaultTimeout, Status
} from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

setDefaultTimeout(60_000);

export let browser: Browser;
export let context: BrowserContext;
export let page: Page;

// 👉 helper buat “restart app”: tutup context & buka lagi
export async function restartApp() {
  await context?.close();
  context = await browser.newContext();
  context.setDefaultTimeout(30_000);
  page = await context.newPage();
}

BeforeAll(async () => {
  browser = await chromium.launch({
    headless: false,   // set ke true kalau mau jalan di background
    // slowMo: 80,     // opsional biar pergerakan kelihatan
  });
});

AfterAll(async () => {
  await browser?.close();
});

Before(async () => {
  context = await browser.newContext();
  context.setDefaultTimeout(30_000);
  page = await context.newPage();
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const shot = await page.screenshot();
    await this.attach(shot, 'image/png');
  }
  await context?.close();
});
