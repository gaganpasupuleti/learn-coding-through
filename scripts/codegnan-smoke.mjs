/**
 * Codegnan Placements – Smoke Test & Feature Catalog
 * 
 * Usage:  npx playwright test scripts/codegnan-smoke.mjs --headed
 *    or:  node scripts/codegnan-smoke.mjs          (standalone)
 *
 * This script:
 *  1. Logs in to placements.codegnan.com
 *  2. Discovers every nav link / sidebar item
 *  3. Visits each page, screenshots it, and records:
 *       – page title / heading
 *       – interactive elements (buttons, inputs, selects, tables, cards)
 *  4. Prints a structured feature catalog to the console
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "https://www.placements.codegnan.com";
const EMAIL = process.env.CODEGNAN_EMAIL || "";
const PASS = process.env.CODEGNAN_PASS || "";
const SCREENSHOT_DIR = path.resolve("scripts/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function slug(text) {
  return text.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").substring(0, 60).toLowerCase();
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const catalog = [];

  // ── Step 1: Navigate to login ──────────────────────────────────
  console.log("\n🔑  Navigating to login page...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  // Sometimes SPA needs extra wait
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_login_page.png"), fullPage: true });

  // ── Step 2: Fill credentials & submit ──────────────────────────
  console.log("🔑  Logging in...");
  // Try common selectors for email / password fields
  const emailSel = await findSelector(page, [
    'input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]',
    'input[placeholder*="mail" i]', 'input[name="username"]', 'input[type="text"]'
  ]);
  const passSel = await findSelector(page, [
    'input[type="password"]', 'input[name="password"]', 'input[placeholder*="password" i]'
  ]);

  if (emailSel && passSel) {
    await page.fill(emailSel, EMAIL);
    await page.fill(passSel, PASS);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_login_filled.png") });

    // Try clicking submit
    const submitSel = await findSelector(page, [
      'button[type="submit"]', 'button:has-text("Login")', 'button:has-text("Sign in")',
      'button:has-text("Log in")', 'input[type="submit"]', 'button:has-text("Submit")'
    ]);
    if (submitSel) {
      await page.click(submitSel);
    } else {
      // Try pressing Enter
      await page.press(passSel, "Enter");
    }
  } else {
    console.log("⚠️  Could not find login form fields. Dumping page HTML...");
    const html = await page.content();
    fs.writeFileSync(path.join(SCREENSHOT_DIR, "login_page_source.html"), html);
  }

  // Wait for navigation after login
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_after_login.png"), fullPage: true });

  const afterLoginUrl = page.url();
  console.log(`📍  After login URL: ${afterLoginUrl}`);

  // ── Step 3: Discover navigation links ──────────────────────────
  console.log("\n🔎  Discovering navigation links...");

  // Collect all links from nav, sidebar, menus
  const navLinks = await page.evaluate(() => {
    const links = new Set();
    // Standard nav links
    document.querySelectorAll("nav a, aside a, [class*='nav'] a, [class*='sidebar'] a, [class*='menu'] a, [role='navigation'] a").forEach(a => {
      if (a.href && !a.href.startsWith("javascript:") && !a.href.startsWith("mailto:")) {
        links.add(JSON.stringify({ href: a.href, text: (a.textContent || "").trim().substring(0, 100) }));
      }
    });
    // Also look for clickable divs / buttons that look like nav items
    document.querySelectorAll("[class*='nav'] [role='button'], [class*='sidebar'] button, [class*='menu'] button").forEach(el => {
      links.add(JSON.stringify({ href: "#click:" + (el.textContent || "").trim().substring(0, 60), text: (el.textContent || "").trim().substring(0, 100) }));
    });
    // Tab-like elements
    document.querySelectorAll("[role='tab'], [class*='tab'] a, [class*='tab'] button").forEach(el => {
      links.add(JSON.stringify({ href: "#tab:" + (el.textContent || "").trim().substring(0, 60), text: (el.textContent || "").trim().substring(0, 100) }));
    });
    return [...links].map(s => JSON.parse(s));
  });

  console.log(`   Found ${navLinks.length} navigation items:`);
  navLinks.forEach(l => console.log(`     • ${l.text}  →  ${l.href}`));

  // Also get ALL anchor hrefs on the page (for comprehensive discovery)
  const allLinks = await page.evaluate((baseUrl) => {
    const links = new Set();
    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.href;
      if (href.startsWith(baseUrl) && !href.includes("logout") && !href.includes("#")) {
        links.add(href);
      }
    });
    return [...links];
  }, BASE);

  console.log(`   Found ${allLinks.length} total internal links`);

  // ── Step 4: Visit each discovered page ─────────────────────────
  const visited = new Set();
  visited.add(afterLoginUrl);

  // Record the dashboard / landing page first
  catalog.push(await analyzePage(page, "Dashboard / Landing"));

  // Visit nav links (real hrefs only)
  const toVisit = [...new Set([...navLinks.map(l => l.href), ...allLinks])]
    .filter(href => href.startsWith("http") && !href.includes("logout") && !visited.has(href));

  let counter = 4;
  for (const url of toVisit) {
    if (visited.has(url)) continue;
    visited.add(url);
    counter++;

    const label = navLinks.find(l => l.href === url)?.text || new URL(url).pathname;
    console.log(`\n📄  Visiting: ${label}  (${url})`);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(2000);

      const ssName = `${String(counter).padStart(2, "0")}_${slug(label)}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssName), fullPage: true });

      catalog.push(await analyzePage(page, label));
    } catch (err) {
      console.log(`   ⚠️  Error visiting ${url}: ${err.message}`);
    }

    // Safety: don't crawl more than 30 pages
    if (counter > 33) {
      console.log("   ⏹  Stopping at 30 pages.");
      break;
    }
  }

  // ── Step 5: Look for dropdown/accordion content ────────────────
  console.log("\n🔎  Checking for expandable menus and dropdowns...");
  // Go back to dashboard
  await page.goto(afterLoginUrl, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Try clicking hamburger / menu toggles
  const menuToggles = await page.$$("[class*='hamburger'], [class*='menu-toggle'], [aria-label*='menu' i], button[class*='toggle']");
  for (const toggle of menuToggles) {
    try {
      await toggle.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${String(++counter).padStart(2, "0")}_menu_expanded.png`), fullPage: true });

      // Discover any new links
      const newLinks = await page.evaluate((baseUrl) => {
        const links = [];
        document.querySelectorAll("a[href]").forEach(a => {
          if (a.href.startsWith(baseUrl) && a.offsetParent !== null) {
            links.push({ href: a.href, text: (a.textContent || "").trim().substring(0, 100) });
          }
        });
        return links;
      }, BASE);

      for (const nl of newLinks) {
        if (!visited.has(nl.href) && !nl.href.includes("logout")) {
          console.log(`   📄  New link discovered: ${nl.text} → ${nl.href}`);
        }
      }
    } catch (e) { /* ignore */ }
  }

  // ── Step 6: Print Feature Catalog ──────────────────────────────
  console.log("\n" + "═".repeat(80));
  console.log("  CODEGNAN PLACEMENTS – FEATURE CATALOG");
  console.log("═".repeat(80));

  for (const entry of catalog) {
    console.log(`\n┌─ PAGE: ${entry.name}`);
    console.log(`│  URL:  ${entry.url}`);
    console.log(`│  Title: ${entry.title}`);
    if (entry.headings.length) {
      console.log(`│  Headings:`);
      entry.headings.forEach(h => console.log(`│    • ${h}`));
    }
    if (entry.forms.length) {
      console.log(`│  Forms (${entry.forms.length}):`);
      entry.forms.forEach(f => console.log(`│    📝 ${f}`));
    }
    if (entry.buttons.length) {
      console.log(`│  Buttons (${entry.buttons.length}):`);
      entry.buttons.forEach(b => console.log(`│    🔘 ${b}`));
    }
    if (entry.tables) {
      console.log(`│  Tables: ${entry.tables}`);
    }
    if (entry.cards) {
      console.log(`│  Cards/Tiles: ${entry.cards}`);
    }
    if (entry.inputs.length) {
      console.log(`│  Inputs (${entry.inputs.length}):`);
      entry.inputs.forEach(i => console.log(`│    ✏️  ${i}`));
    }
    if (entry.selects.length) {
      console.log(`│  Dropdowns (${entry.selects.length}):`);
      entry.selects.forEach(s => console.log(`│    📋 ${s}`));
    }
    if (entry.modals.length) {
      console.log(`│  Modal/Dialog indicators: ${entry.modals.join(", ")}`);
    }
    if (entry.charts) {
      console.log(`│  Charts/Graphs: ${entry.charts}`);
    }
    console.log(`└${"─".repeat(78)}`);
  }

  // Save catalog as JSON
  const catalogPath = path.join(SCREENSHOT_DIR, "feature_catalog.json");
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`\n✅  Feature catalog saved to ${catalogPath}`);
  console.log(`📸  Screenshots saved to ${SCREENSHOT_DIR}/`);

  await browser.close();
}

// ── Helpers ────────────────────────────────────────────────────────

async function findSelector(page, candidates) {
  for (const sel of candidates) {
    try {
      const el = await page.$(sel);
      if (el) return sel;
    } catch { /* ignore */ }
  }
  return null;
}

async function analyzePage(page, name) {
  return page.evaluate((pageName) => {
    const text = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").substring(0, 120);

    // Headings
    const headings = [...document.querySelectorAll("h1, h2, h3")]
      .map(h => `${h.tagName}: ${text(h)}`)
      .filter(t => t.length > 4)
      .slice(0, 15);

    // Forms
    const forms = [...document.querySelectorAll("form")]
      .map(f => {
        const inputs = f.querySelectorAll("input, select, textarea");
        return `${inputs.length} fields – ${text(f).substring(0, 80)}`;
      });

    // Buttons
    const buttons = [...document.querySelectorAll("button, [role='button'], input[type='submit']")]
      .map(b => text(b))
      .filter(t => t.length > 0 && t.length < 60)
      .slice(0, 20);

    // Tables
    const tables = document.querySelectorAll("table").length;

    // Cards
    const cards = document.querySelectorAll("[class*='card'], [class*='Card'], [class*='tile'], [class*='Tile']").length;

    // Inputs
    const inputs = [...document.querySelectorAll("input:not([type='hidden']), textarea")]
      .map(i => `${i.type || "text"} – ${i.placeholder || i.name || i.id || "(no label)"}`)
      .slice(0, 15);

    // Selects
    const selects = [...document.querySelectorAll("select")]
      .map(s => {
        const opts = [...s.options].map(o => o.text).slice(0, 5).join(", ");
        return `${s.name || s.id || "dropdown"}: ${opts}`;
      });

    // Modals
    const modals = [...document.querySelectorAll("[class*='modal'], [class*='Modal'], [role='dialog'], [class*='dialog']")]
      .map(m => m.className.substring(0, 60));

    // Charts
    const charts = document.querySelectorAll("canvas, svg[class*='chart'], [class*='chart'], [class*='Chart'], [class*='graph']").length;

    return {
      name: pageName,
      url: window.location.href,
      title: document.title,
      headings,
      forms,
      buttons,
      tables,
      cards,
      inputs,
      selects,
      modals,
      charts,
    };
  }, name);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
