#!/usr/bin/env node
// scripts/playwright-tour.mjs
//
// Opens the Altru frontend in a headed Chromium window so you can watch it
// live, takes a screenshot of the landing page, and keeps the browser open until
// you close it (or Ctrl-C the parent script).
//
// Usage:
//   node scripts/playwright-tour.mjs                       # http://localhost:5173
//   node scripts/playwright-tour.mjs http://localhost:5173

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.argv[2] || 'http://localhost:5173';
const __dirname = dirname(fileURLToPath(import.meta.url));
const shotDir = resolve(__dirname, '..', '.tour');
mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ headless: false, slowMo: 150 });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

page.on('console', (m) => console.log(`[browser:${m.type()}]`, m.text()));
page.on('pageerror', (e) => console.error('[browser:error]', e.message));

console.log(`Opening ${url}…`);
await page.goto(url, { waitUntil: 'networkidle' });
const shot = resolve(shotDir, 'landing.png');
await page.screenshot({ path: shot, fullPage: true });
console.log(`Screenshot → ${shot}`);

console.log('Browser is open. Close the window to exit.');
await page.waitForEvent('close', { timeout: 0 }).catch(() => {});
await browser.close();
