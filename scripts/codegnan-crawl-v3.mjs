/**
 * Codegnan Placements – Deep Crawl v3
 * Handles session conflicts, uses precise locators for sidebar navigation.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "https://www.placements.codegnan.com";
const EMAIL = process.env.CODEGNAN_EMAIL || "";
const PASS  = process.env.CODEGNAN_PASS || "";
const DIR   = path.resolve("scripts/screenshots/v3");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // ── Login (handle session conflict) ──
  console.log("🔑  Logging in...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  await page.fill('input[placeholder*="email" i]', EMAIL);
  await page.fill('input[type="password"]', PASS);

  // Click Login
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  // Check for "Logout All Sessions" button (session conflict)
  const logoutAll = await page.$('button:has-text("Logout All Sessions")');
  if (logoutAll) {
    console.log("⚠️  Session conflict detected — logging out all sessions...");
    await logoutAll.click();
    await page.waitForTimeout(3000);

    // Re-fill and login again
    await page.fill('input[placeholder*="email" i]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(5000);
  }

  // Wait for dashboard
  await page.waitForTimeout(3000);
  const url = page.url();
  console.log(`📍  After login: ${url}`);

  if (url.includes("login")) {
    console.log("❌  Still on login page. Saving HTML for debug...");
    fs.writeFileSync(path.join(DIR, "login_debug.html"), await page.content());
    await page.screenshot({ path: path.join(DIR, "login_stuck.png"), fullPage: true });
    await browser.close();
    return;
  }

  // ── Screenshot full dashboard with scroll ──
  await screenshotWithScroll(page, "00_dashboard", DIR);

  // ── Navigate to each sidebar page using URL patterns ──
  // First, let's discover what routes exist by reading the sidebar DOM
  const sidebarInfo = await page.evaluate(() => {
    // Get all text content from sidebar-like areas
    const allButtons = [...document.querySelectorAll("button, a")];
    return allButtons.map(b => ({
      tag: b.tagName,
      text: (b.textContent || "").trim().replace(/\s+/g, " ").substring(0, 80),
      href: b.href || "",
      classes: b.className?.substring?.(0, 100) || "",
      dataAttrs: [...b.attributes].filter(a => a.name.startsWith("data-")).map(a => `${a.name}=${a.value}`).join(", "),
    })).filter(b => b.text.length > 0 && b.text.length < 80);
  });

  console.log(`\n📋  All clickable elements (${sidebarInfo.length}):`);
  sidebarInfo.forEach(b => console.log(`   [${b.tag}] "${b.text}" ${b.href ? '→ ' + b.href : ''} ${b.classes ? '{' + b.classes.substring(0, 50) + '}' : ''}`));

  // ── Click sidebar items one by one using getByRole/exact text ──
  const sidebarItems = [
    "Dashboard",
    "Jobs List",
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

  const catalog = [];
  let idx = 0;

  for (const label of sidebarItems) {
    idx++;
    console.log(`\n📄  [${idx}/${sidebarItems.length}] Clicking: "${label}"`);

    // Use getByRole with exact name matching
    try {
      const btn = page.getByRole("button", { name: label, exact: true });
      const count = await btn.count();
      if (count === 0) {
        // Try as link
        const link = page.getByRole("link", { name: label, exact: true });
        const linkCount = await link.count();
        if (linkCount > 0) {
          await link.first().click();
        } else {
          // Try text-based click
          const textEl = page.locator(`text="${label}"`);
          const textCount = await textEl.count();
          if (textCount > 0) {
            await textEl.first().click();
          } else {
            console.log(`   ⚠️  Not found: "${label}"`);
            continue;
          }
        }
      } else {
        await btn.first().click();
      }
    } catch (err) {
      console.log(`   ⚠️  Click error: ${err.message.substring(0, 100)}`);
      continue;
    }

    await page.waitForTimeout(2500);
    const pageUrl = page.url();
    console.log(`   URL: ${pageUrl}`);

    // Screenshot
    const slug = label.replace(/\s+/g, "_").toLowerCase();
    await screenshotWithScroll(page, `${String(idx).padStart(2, "0")}_${slug}`, DIR);

    // Analyze
    const analysis = await analyzePage(page);
    catalog.push({ label, url: pageUrl, ...analysis });

    console.log(`   Headings: ${analysis.headings.join(" | ").substring(0, 200)}`);
    console.log(`   Buttons: ${analysis.buttons.length} | Tables: ${analysis.tables} | Cards: ${analysis.cards} | Charts: ${analysis.charts}`);
    if (analysis.tabs.length) console.log(`   Tabs: ${analysis.tabs.join(" | ")}`);
    if (analysis.inputs.length) console.log(`   Inputs: ${analysis.inputs.join(", ").substring(0, 200)}`);
  }

  // ── Print structured catalog ──
  console.log("\n" + "═".repeat(80));
  console.log("  CODEGNAN PLACEMENTS – COMPLETE FEATURE CATALOG");
  console.log("═".repeat(80));

  for (const e of catalog) {
    console.log(`\n┌─ ${e.label.toUpperCase()}`);
    console.log(`│  URL: ${e.url}`);
    if (e.headings.length) {
      console.log(`│  Headings:`);
      e.headings.forEach(h => console.log(`│    • ${h}`));
    }
    if (e.tabs.length) console.log(`│  Tabs: ${e.tabs.join(" | ")}`);
    if (e.inputs.length) {
      console.log(`│  Inputs:`);
      e.inputs.forEach(i => console.log(`│    ✏️  ${i}`));
    }
    if (e.buttons.length) {
      console.log(`│  Actions:`);
      e.buttons.forEach(b => console.log(`│    🔘 ${b}`));
    }
    if (e.selects.length) {
      console.log(`│  Dropdowns:`);
      e.selects.forEach(s => console.log(`│    📋 ${s}`));
    }
    console.log(`│  Tables: ${e.tables} | Cards: ${e.cards} | Charts: ${e.charts}`);
    if (e.snapshot) console.log(`│  Content preview: ${e.snapshot.substring(0, 300)}`);
    console.log(`└${"─".repeat(78)}`);
  }

  // Save
  fs.writeFileSync(path.join(DIR, "feature_catalog.json"), JSON.stringify(catalog, null, 2));
  console.log(`\n✅  Catalog saved to ${path.join(DIR, "feature_catalog.json")}`);
  console.log(`📸  Screenshots in ${DIR}/`);

  await browser.close();
}

async function screenshotWithScroll(page, name, dir) {
  // Scroll to load lazy content
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 800) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

async function analyzePage(page) {
  return page.evaluate(() => {
    const t = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").substring(0, 150);

    const headings = [...document.querySelectorAll("h1, h2, h3, h4")]
      .map(h => `${h.tagName}: ${t(h)}`)
      .filter(x => x.length > 5)
      .slice(0, 20);

    const buttons = [...document.querySelectorAll("button:not([class*='sidebar']):not([class*='nav']), [role='button'], input[type='submit']")]
      .filter(b => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0; // visible only
      })
      .map(b => t(b))
      .filter(x => x.length > 0 && x.length < 80)
      .slice(0, 25);

    const inputs = [...document.querySelectorAll("input:not([type='hidden']), textarea")]
      .filter(i => { const r = i.getBoundingClientRect(); return r.width > 0; })
      .map(i => `${i.type || "text"}: ${i.placeholder || i.name || i.ariaLabel || "(no label)"}`)
      .slice(0, 15);

    const selects = [...document.querySelectorAll("select")]
      .map(s => {
        const opts = [...s.options].map(o => o.text).slice(0, 5).join(", ");
        return `${s.name || s.id || "dropdown"}: [${opts}]`;
      });

    const tables = document.querySelectorAll("table, [role='table'], [class*='table' i]").length;
    const cards = document.querySelectorAll("[class*='card' i]").length;
    const charts = document.querySelectorAll("canvas, [class*='chart' i], [class*='recharts']").length;

    const tabs = [...document.querySelectorAll("[role='tab'], [role='tablist'] button")]
      .map(tb => (tb.textContent || "").trim())
      .filter(x => x.length > 0 && x.length < 40)
      .slice(0, 10);

    // Main content text snapshot
    const main = document.querySelector("[class*='content' i], [class*='main' i], main");
    const snapshot = main ? t(main).substring(0, 400) : "";

    return { headings, buttons, inputs, selects, tables, cards, charts, tabs, snapshot };
  });
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
