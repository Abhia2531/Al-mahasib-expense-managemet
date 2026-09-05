/**
 * Verifies .env + schema before you run the app.
 *
 *   node scripts/check-supabase.mjs
 *
 * Reads .env directly (no dev server needed) and reports exactly which of
 * the four required pieces is missing: URL, secret key, table, or view.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---- read .env (tolerating CRLF and quotes) ---------------------- */
let env = {};
try {
  for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].replace(/\r$/, "").replace(/^["']|["']$/g, "").trim();
  }
} catch {
  fail("No .env file found. Copy .env.example to .env and fill it in.");
}

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = env.SUPABASE_SECRET_KEY || "";

if (!env.SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("  · using NEXT_PUBLIC_SUPABASE_URL (SUPABASE_URL not set)");
}
if (env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
  fail(
    "SUPABASE_SECRET_KEY is prefixed with NEXT_PUBLIC_ in your .env.\n" +
      "    That would ship the secret key to the browser. Rename it to plain\n" +
      "    SUPABASE_SECRET_KEY.",
  );
}

function fail(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

/* ---- 1. shape checks ------------------------------------------- */
console.log("\nChecking .env …\n");

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
  fail(`SUPABASE_URL looks wrong: "${url || "(empty)"}"\n` +
       `    Expected: https://<project-ref>.supabase.co`);
}
ok("SUPABASE_URL format looks right");

if (!secret) fail("SUPABASE_SECRET_KEY is empty.");
if (/^sb_secret_key_/.test(secret) || /^(.)([0-9][A-Za-z]){10}/.test(secret)) {
  fail(`SUPABASE_SECRET_KEY looks like a placeholder, not a real key.\n` +
       `    Real secret keys start with "sb_secret_" (no "_key_") or "eyJ" (legacy JWT).\n` +
       `    Get it from: Supabase Dashboard -> Project Settings -> API Keys -> Secret keys`);
}
if (!/^sb_secret_/.test(secret) && !/^eyJ/.test(secret)) {
  fail(`SUPABASE_SECRET_KEY does not look like a Supabase key.\n` +
       `    Expected it to start with "sb_secret_" or "eyJ".`);
}
ok("SUPABASE_SECRET_KEY format looks right");

/* ---- 2. live checks ------------------------------------------- */
const base = url.replace(/\/$/, "");
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };

const rootRes = await fetch(`${base}/rest/v1/`, { headers }).catch((e) =>
  fail(`Could not reach ${base} — ${e.message}`),
);

if (rootRes.status === 401) {
  const body = await rootRes.json().catch(() => ({}));
  fail(`Supabase rejected the secret key: "${body.message || rootRes.status}"\n` +
       `    The key in .env is not valid for this project.`);
}
ok("Secret key accepted by Supabase");

/* ---- 3. schema check ----------------------------------------- */
let missing = [];
for (const rel of [
  "projects",
  "daily_expenses",
  "advances",
  "progress_bills",
  "project_financials",
  "daily_expense_totals",
]) {
  const r = await fetch(`${base}/rest/v1/${rel}?limit=0`, { headers });
  if (r.status === 404 || r.status === 406) {
    const b = await r.json().catch(() => ({}));
    if ((b.code || "") === "PGRST205" || /Could not find/.test(b.message || "")) {
      missing.push(rel);
    }
  }
}

if (missing.length) {
  fail(`These tables/views are missing: ${missing.join(", ")}\n` +
       `    Run supabase/schema.sql once in the Supabase SQL Editor.`);
}
ok("All tables and views exist");

console.log("\n  Everything checks out. Run: npm run dev\n");
