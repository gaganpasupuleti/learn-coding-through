/**
 * Codegnan Placements – Deep Crawl v2
 * Clicks each sidebar item, scrolls the page, and screenshots every section.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "https://www.placements.codegnan.com";
const EMAIL = process.env.CODEGNAN_EMAIL || "";
const PASS  = process.env.CODEGNAN_PASS || "";
const DIR   = path.resolve("scripts/screenshots/v2");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const SIDEBAR_ITEMS = [
  "Dashboard",
  "Jobs List",       // expand sub-menu
  "All Jobs",
  "Applied Jobs",
  "WorkSpace Studio",
  "My Course",
  "Attendance",
  "Exams",
  "Code Playground",
  "Exam Reports",
  "Forms",
  "Code Leaderboard",
  "Leave Request",
  "Remarks",
];

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // ── Login ──
  console.log("🔑  Logging in...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  const submit = await page.$('button[type="submit"], button:has-text("Login")');
  if (submit) await submit.click();
  else await page.keyboard.press("Enter");

  await page.waitForTimeout(5000);
  console.log(`📍  Landed: ${page.url()}`);

  // Take full-page dashboard screenshot (scrolled)
  await scrollAndScreenshot(page, "00_dashboard_full");

  // ── Click each sidebar item ──
  const catalog = [];
  let idx = 1;

  for (const label of SIDEBAR_ITEMS) {
    console.log(`\n📄  Clicking sidebar: "${label}"`);

    // Find button/link by text
    const btn = await page.$(`button:has-text("${label}"), a:has-text("${label}"), span:has-text("${label}"), div:has-text("${label}")`);
    if (!btn) {
      console.log(`   ⚠️  Not found: ${label}`);
      continue;
    }

    try {
      await btn.click();
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log(`   ⚠️  Click failed: ${e.message}`);
      continue;
    }

    const url = page.url();
    const num = String(idx++).padStart(2, "0");
    const slug = label.replace(/\s+/g, "_").toLowerCase();

    // Full-page screenshot
    await scrollAndScreenshot(page, `${num}_${slug}`);

    // Analyze page
    const analysis = await page.evaluate(() => {
      const t = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").substring(0, 200);

      const headings = [...document.querySelectorAll("h1, h2, h3, h4")]
        .map(h => `${h.tagName}: ${t(h)}`)
        .filter(x => x.length > 5)
        .slice(0, 20);

      const buttons = [...document.querySelectorAll("button, [role='button'], input[type='submit']")]
        .map(b => t(b))
        .filter(x => x.length > 0 && x.length < 80)
        .slice(0, 25);

      const inputs = [...document.querySelectorAll("input:not([type='hidden']), textarea, select")]
        .map(i => {
          const tag = i.tagName.toLowerCase();
          if (tag === "select") {
            const opts = [...i.options].map(o => o.text).slice(0, 5).join(", ");
            return `select: ${i.name || i.id || ""} [${opts}]`;
          }
          return `${i.type || "text"}: ${i.placeholder || i.name || i.ariaLabel || "(none)"}`;
        })
        .slice(0, 20);

      const tables = document.querySelectorAll("table").length;
      const cards = document.querySelectorAll("[class*='card' i], [class*='Card']").length;
      const charts = document.querySelectorAll("canvas, [class*='chart' i], [class*='recharts'], svg.recharts-surface").length;
      const tabs = [...document.querySelectorAll("[role='tab'], [class*='tab' i] button, [class*='Tab'] button")]
        .map(t2 => (t2.textContent || "").trim())
        .filter(x => x.length > 0 && x.length < 40)
        .slice(0, 10);

      // Look for key feature text
      const mainText = document.querySelector("main, [class*='content' i], [class*='main' i]");
      const snapshot = mainText ? (mainText.textContent || "").trim().replace(/\s+/g, " ").substring(0, 500) : "";

      return { headings, buttons, inputs, tables, cards, charts, tabs, snapshot };
    });

    catalog.push({ label, url, ...analysis });

    console.log(`   URL: ${url}`);
    console.log(`   Headings: ${analysis.headings.length}`);
    console.log(`   Buttons: ${analysis.buttons.length}`);
    console.log(`   Inputs: ${analysis.inputs.length}`);
    console.log(`   Tables: ${analysis.tables}, Cards: ${analysis.cards}, Charts: ${analysis.charts}`);
    if (analysis.tabs.length) console.log(`   Tabs: ${analysis.tabs.join(" | ")}`);
  }

  // ── Scroll dashboard for hidden widgets ──
  console.log("\n📜  Scrolling dashboard for all widgets...");
  await page.goto(`${BASE}/student/performance`, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Scroll to bottom in increments, screenshot each viewport
  let scrollY = 0;
  let viewIdx = 0;
  const viewportH = 900;
  const maxScroll = await page.evaluate(() => document.body.scrollHeight);
  while (scrollY < maxScroll) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(DIR, `dashboard_scroll_${viewIdx}.png`) });
    scrollY += viewportH - 100;
    viewIdx++;
    if (viewIdx > 15) break;
  }

  // ── Save catalog ──
  fs.writeFileSync(path.join(DIR, "deep_catalog.json"), JSON.stringify(catalog, null, 2));

  // ── Print summary ──
  console.log("\n" + "═".repeat(80));
  console.log("  CODEGNAN PLACEMENTS – COMPLETE FEATURE CATALOG");
  console.log("═".repeat(80));

  for (const entry of catalog) {
    console.log(`\n┌─ ${entry.label.toUpperCase()}`);
    console.log(`│  ${entry.url}`);
    if (entry.headings.length) {
      console.log(`│  Sections:`);
      entry.headings.forEach(h => console.log(`│    ${h}`));
    }
    if (entry.tabs.length) console.log(`│  Tabs: ${entry.tabs.join(" | ")}`);
    if (entry.inputs.length) {
      console.log(`│  Inputs:`);
      entry.inputs.forEach(i => console.log(`│    ${i}`));
    }
    if (entry.buttons.length) {
      console.log(`│  Actions:`);
      entry.buttons.forEach(b => console.log(`│    [${b}]`));
    }
    console.log(`│  Tables: ${entry.tables} | Cards: ${entry.cards} | Charts: ${entry.charts}`);
    console.log(`└${"─".repeat(78)}`);
  }

  console.log(`\n✅  Done. Screenshots: ${DIR}/`);
  await browser.close();
}

async function scrollAndScreenshot(page, name) {
  // Scroll to bottom first to trigger lazy-loaded content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: true });
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
