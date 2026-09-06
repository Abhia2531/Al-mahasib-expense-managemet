/**
 * Pre-flight for .env + Supabase, before `npm run dev`.
 *
 *   node scripts/check-supabase.mjs
 *
 * Checks: the two public env vars, that the publishable key reaches the
 * project, that schema.sql has been applied, and that RLS is locked down
 * (anon can read nothing). It cannot verify the authenticated-role policies
 * or that a user exists — those need a login — so it prints reminders.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const c = { ok: "  ✓ ", no: "  ✗ ", info: "  · " };
let failed = false;
const fail = (m) => {
  console.error(`\n${c.no}${m}\n`);
  process.exitCode = 1;
  failed = true;
};
const ok = (m) => console.log(c.ok + m);
const info = (m) => console.log(c.info + m);

/* ---- read .env ------------------------------------------------- */
let env = {};
try {
  for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].replace(/\r$/, "").replace(/^["']|["']$/g, "").trim();
  }
} catch {
  fail("No .env file. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const url =
  env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
const key =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  "";

console.log("\nChecking .env …\n");

for (const leaked of ["SUPABASE_SECRET_KEY", "NEXT_PUBLIC_SUPABASE_SECRET_KEY"]) {
  if (env[leaked]) {
    info(
      `${leaked} is set but unused — this app has no service-role key. ` +
        `You can remove that line.`,
    );
  }
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
  fail(`NEXT_PUBLIC_SUPABASE_URL looks wrong: "${url || "(empty)"}"`);
}
if (!/^sb_publishable_/.test(key) && !/^eyJ/.test(key)) {
  fail(
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY should start with "sb_publishable_" ` +
      `or "eyJ". Got "${key.slice(0, 12)}…"`,
  );
}
if (failed) process.exit(1);
ok("Env vars present and well-formed");

/* ---- live checks --------------------------------------------- */
const base = url.replace(/\/$/, "");
const h = { apikey: key, Authorization: `Bearer ${key}` };

const res = await fetch(`${base}/rest/v1/projects?limit=1`, { headers: h }).catch(
  (e) => {
    fail(`Could not reach ${base} — ${e.message}`);
    process.exit(1);
  },
);
const body = await res.json().catch(() => ({}));
const msg = body.message || "";

if (/unregistered/i.test(msg)) {
  fail(
    `Supabase says the key is "Unregistered" — it was revoked or rotated.\n` +
      `    Copy the current publishable key from Project Settings -> API Keys.`,
  );
  process.exit(1);
}
if (/invalid.*api key/i.test(msg)) {
  fail(`Supabase rejected the key: "${msg}"`);
  process.exit(1);
}
if (body.code === "PGRST205" || /Could not find the table/i.test(msg)) {
  fail(`Schema not applied. Run supabase/schema.sql in the SQL Editor.`);
  process.exit(1);
}
ok("Publishable key reaches the project");

/* anon should be denied (RLS on, no anon policy) — that is the goal. */
if (res.status === 200) {
  info(
    "anon can READ the tables — RLS is not locked down.\n" +
      "    If you ran an older enable-app-access.sql, drop its anon policies;\n" +
      "    the app now uses authenticated-only policies (auth-policies.sql).",
  );
} else if (res.status === 401 && body.code === "42501") {
  ok("RLS is locked down (anon denied)");
} else if (res.status === 401) {
  ok("RLS is locked down (anon denied)");
}

console.log(`
  Two things still need doing in the Supabase dashboard:
    1. SQL Editor  -> run supabase/auth-policies.sql
    2. Authentication -> Users -> Add user  (tick "Auto Confirm User")

  Then:  npm run dev   ->   sign in at /login
`);
