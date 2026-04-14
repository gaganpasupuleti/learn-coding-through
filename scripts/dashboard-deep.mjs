/**
 * Dashboard-only deep scroll — capture every viewport segment + full DOM analysis
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "https://www.placements.codegnan.com";
const EMAIL = process.env.CODEGNAN_EMAIL || "";
const PASS  = process.env.CODEGNAN_PASS || "";
const DIR   = path.resolve("scripts/screenshots/dashboard");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder*="email" i]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  const logoutAll = await page.$('button:has-text("Logout All Sessions")');
  if (logoutAll) {
    await logoutAll.click();
    await page.waitForTimeout(3000);
    await page.fill('input[placeholder*="email" i]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(5000);
  }
  await page.waitForTimeout(3000);

  if (page.url().includes("login")) {
    console.log("Login failed");
    await browser.close();
    return;
  }

  console.log(`Dashboard: ${page.url()}`);

  // Scroll to bottom first to load all lazy content
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < scrollHeight; y += 400) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(2000);

  // Get updated scroll height after lazy loads
  const finalHeight = await page.evaluate(() => document.body.scrollHeight);

  // Scroll from top, screenshot each viewport
  let idx = 0;
  for (let y = 0; y < finalHeight; y += 800) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(DIR, `scroll_${String(idx).padStart(2, "0")}.png`) });
    idx++;
    if (idx > 20) break;
  }

  // Also take full-page screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(DIR, "full_page.png"), fullPage: true });

  // Deep DOM analysis — find EVERY widget/section
  const widgets = await page.evaluate(() => {
    // Get the main content area (exclude sidebar)
    const mainContent = document.querySelector("[class*='content' i]") || document.querySelector("main") || document.body;

    // Find all direct and nested section-like containers
    // Look for cards, sections with headings, distinct UI blocks
    const sections = [];

    // Strategy: find all h1-h4, then describe nested content
    const headings = mainContent.querySelectorAll("h1, h2, h3, h4");
    headings.forEach(h => {
      const parent = h.closest("[class*='card' i], [class*='Card'], [class*='section' i], [class*='widget' i], [class*='block' i], [class*='panel' i], [class*='container' i], div > div") || h.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const t = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").substring(0, 200);

      // Collect interactive elements inside this section
      const btns = [...parent.querySelectorAll("button, a[href]")].map(b => t(b)).filter(x => x.length > 0 && x.length < 60).slice(0, 5);
      const inps = [...parent.querySelectorAll("input, select, textarea")].map(i => `${i.type || i.tagName}: ${i.placeholder || i.name || ""}`).slice(0, 5);
      const hasChart = parent.querySelector("canvas, svg, [class*='chart' i], [class*='recharts']") !== null;
      const hasTable = parent.querySelector("table, [role='table']") !== null;
      const imgs = parent.querySelectorAll("img").length;

      sections.push({
        heading: `${h.tagName}: ${t(h)}`,
        text: t(parent).substring(0, 300),
        buttons: btns,
        inputs: inps,
        hasChart,
        hasTable,
        images: imgs,
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
      });
    });

    // Also find elements without headings but with distinctive classes
    const specialWidgets = mainContent.querySelectorAll("[class*='heatmap' i], [class*='streak' i], [class*='badge' i], [class*='leaderboard' i], [class*='notification' i], [class*='calendar' i]");
    specialWidgets.forEach(w => {
      const t = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").substring(0, 200);
      sections.push({
        heading: `WIDGET: ${w.className.substring(0, 80)}`,
        text: t(w).substring(0, 300),
        buttons: [],
        inputs: [],
        hasChart: false,
        hasTable: false,
        images: 0,
        top: Math.round(w.getBoundingClientRect().top + window.scrollY),
        height: Math.round(w.getBoundingClientRect().height),
      });
    });

    // Sort by vertical position
    sections.sort((a, b) => a.top - b.top);

    return { totalHeight: document.body.scrollHeight, widgetCount: sections.length, widgets: sections };
  });

  console.log(`\nTotal page height: ${widgets.totalHeight}px`);
  console.log(`Found ${widgets.widgetCount} widgets/sections:\n`);

  widgets.widgets.forEach((w, i) => {
    console.log(`[${i + 1}] ${w.heading}`);
    console.log(`    Position: ${w.top}px, Height: ${w.height}px`);
    console.log(`    Content: ${w.text.substring(0, 150)}`);
    if (w.buttons.length) console.log(`    Buttons: ${w.buttons.join(" | ")}`);
    if (w.inputs.length) console.log(`    Inputs: ${w.inputs.join(", ")}`);
    if (w.hasChart) console.log(`    📊 Has chart/graph`);
    if (w.hasTable) console.log(`    📋 Has table`);
    if (w.images) console.log(`    🖼  Images: ${w.images}`);
    console.log();
  });

  fs.writeFileSync(path.join(DIR, "dashboard_analysis.json"), JSON.stringify(widgets, null, 2));
  console.log(`✅ Saved to ${DIR}/`);
  await browser.close();
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
