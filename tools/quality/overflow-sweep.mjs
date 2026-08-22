/*
 * Ad-hoc responsive overflow sweep for the block-sample pages.
 * Loads each sample at 390/768/1440 and asserts no horizontal page overflow.
 * Run: node tools/quality/overflow-sweep.mjs   (dev server must be up)
 */
import { chromium } from 'playwright';

const pages = ['accordion', 'tabs', 'table', 'columns-stats', 'columns-feature',
  'cards-overlay', 'cards-audio', 'cards-product', 'video', 'downloads', 'hero-slider', 'hero-movie', 'timeline',
  'biome-explorer', 'dashboard-tabs', 'flipbook', 'web-story', 'orgchart', 'energy-journey', 'energy-map'];
const widths = [390, 768, 1440];
const base = 'http://localhost:3000/content/drafts/block-samples/';

const browser = await chromium.launch();
const results = [];
for (const p of pages) {
  const row = { page: p };
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(base + p, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(400);
      const docW = await page.evaluate(() => document.documentElement.scrollWidth);
      const winW = await page.evaluate(() => window.innerWidth);
      row[`w${w}`] = (docW <= winW + 1) ? 'OK' : `OVERFLOW(${docW}>${winW})`;
    } catch (e) {
      row[`w${w}`] = `ERR:${e.message.slice(0, 40)}`;
    }
    await ctx.close();
  }
  results.push(row);
  process.stdout.write(`${p.padEnd(16)} 390:${(row.w390 || '').padEnd(18)} 768:${(row.w768 || '').padEnd(18)} 1440:${row.w1440 || ''}\n`);
}
await browser.close();
const bad = results.filter((r) => [r.w390, r.w768, r.w1440].some((v) => v && v !== 'OK'));
process.stdout.write(`\n=== ${bad.length ? `${bad.length} PAGE(S) WITH ISSUES` : 'ALL PAGES CLEAN — no horizontal overflow at 390/768/1440'} ===\n`);
