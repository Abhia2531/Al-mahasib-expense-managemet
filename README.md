# Al Mahasib — Project Finance Management

Track expenses, advance payments and progress billing **separately for every
project**. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and
Supabase/PostgreSQL.

---

## Getting started

### 1. Add your Supabase credentials

Open **Supabase Dashboard → Project Settings → API Keys** and copy the values
into `.env`:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

Both are server-side only. Neither carries the `NEXT_PUBLIC_` prefix, so
Next.js will never inline them into the browser bundle.

> The publishable key is not used. Every database call happens on the server,
> so the browser never talks to Supabase directly and never needs a key.

### 2. Create the tables

In Supabase open **SQL Editor → New query**, paste the whole of
[`supabase/schema.sql`](supabase/schema.sql), and run it once. It creates the
four tables, two aggregate views, indexes, triggers and the RLS lockdown.

### 3. Verify, then run

```bash
npm install
npm run check:supabase   # checks .env + that the schema is applied
npm run dev              # http://localhost:3000
```

`check:supabase` reads `.env` directly and tells you exactly which piece is
missing — bad URL, placeholder key, or un-applied schema — without needing the
dev server. If the keys or schema are missing at runtime, the app also says so
on screen instead of crashing.

> **Editing `.env` while `npm run dev` is running does nothing.** Next.js reads
> it only at startup — stop the server (Ctrl+C) and start it again.

---

## How the data is kept separate

The requirement that matters most is that **no figure ever mixes two
projects**. Three things enforce it:

1. **Schema** — `daily_expenses`, `advances` and `progress_bills` each carry a
   `project_id` foreign key with `on delete cascade`. There is no way to store
   a financial record that is not attached to exactly one project.
2. **Reads** — every query lives in [`src/lib/queries.ts`](src/lib/queries.ts)
   and is filtered by `.eq("project_id", …)`. No function in that file can
   return rows from two projects.
3. **Writes** — every action in [`src/lib/actions.ts`](src/lib/actions.ts)
   re-reads `project_id` from the submitted form and adds it to the `update` /
   `delete` filter, so a record cannot be edited or removed from a project
   other than the one on screen.

Totals are computed **in the database**, by the `project_financials` view, not
by pulling rows into JavaScript and summing them. A project with 50,000 expense
lines still renders its dashboard from a single row.

---

## Security model

There is no login in this app, because the brief did not ask for one. Rather
than leave the database open, access is locked down like this:

- RLS is **enabled** on all four tables, with **no policies** granted to `anon`
  or `authenticated`, plus an explicit `revoke all`. The publishable key can
  therefore read and write **nothing**, even if it leaks.
- All access runs server-side with the secret key, which bypasses RLS.
- [`src/lib/supabase.ts`](src/lib/supabase.ts) imports `server-only`, so
  importing it from a Client Component is a **build error**, not a runtime
  surprise. That is what keeps the secret key out of the browser bundle.

If you later add user accounts, the change is additive: write RLS policies
keyed on `auth.uid()` and move the reads to the publishable key.

---

## Screens

| Route | What it does |
| --- | --- |
| `/` | Logo, New Project button, searchable list of all projects |
| `/projects/new` | Create form; opens the new project's dashboard on save |
| `/projects/[id]` | Dashboard — all figures for that project only |
| `/projects/[id]/expenses` | Index of daily expense pages, newest first |
| `/projects/[id]/expenses/[date]` | **One day's page**: Material \| Price + Daily Total |
| `/projects/[id]/advances` | Record and list advance payments |
| `/projects/[id]/billing` | Progress bills: raise, edit, delete |
| `/projects/[id]/reports` | Full financial summary + per-day, per-advance, per-bill breakdowns |

A day's page exists as soon as you navigate to its date — there is nothing to
"create" first. `‹ Previous` / `Today` / `Next ›` move between days, and the
add-row form clears and refocuses itself after each save so a whole day can be
typed without touching the mouse.

---

## The calculations

All scoped to a single `project_id`:

```
Daily Total             = sum of prices on that date
Total Project Expenses  = sum of all daily expenses
Total Advance Received  = sum of all advance payments
Remaining Advance       = Total Advance Received − Total Project Expenses
Total Billed            = sum of all bill amounts
Total Billing Received  = sum of all amounts received
Outstanding Billing     = Total Billed − Total Billing Received
```

---

## Design decisions worth knowing

**Billing status is derived, not typed in.** The brief lists Billing Status as
a field the user records. It is instead a Postgres `GENERATED` column:

```
amount_received = 0            → Pending
0 < amount_received < bill      → Partially Paid
amount_received >= bill_amount → Paid
```

The status can never contradict the amounts it sits next to, and there is one
less field to get wrong during entry. Update **Amount received** as payments
arrive and the status follows. If you would rather set it by hand, drop the
`generated always as (…) stored` clause and make it a plain `text` column with
a check constraint.

**"Advance Payment Received" on the create form** is saved as the project's
first row in `advances`, not as a column on `projects`. That way every advance
— the initial one and every later payment — is counted the same way, from one
place.

**`amount_received` cannot exceed `bill_amount`**, enforced by a check
constraint as well as in the form. Bill numbers are unique per project, not
globally, so two projects can both have an "IPC-01".

**Daily expenses hold only what was asked for**: `project_id`, `expense_date`,
`material`, `price`. No category, payment method, description or notes column
exists in that table. The date lives on the page, so the table on screen is
just **Material | Price**.

**Deleting is available for advances and bills** even though the brief only
asked for it on expenses — a finance record entered by mistake has to be
correctable. Every delete asks for confirmation inline first.

---

## Project structure

```
src/
  app/
    layout.tsx                      header, logo, skip link, theme
    page.tsx                        homepage: search + project list
    projects/new/page.tsx           create form
    projects/[id]/
      layout.tsx                    project header + section tabs
      page.tsx                      dashboard
      expenses/page.tsx             day index
      expenses/[date]/page.tsx      one day
      advances/page.tsx
      billing/page.tsx
      reports/page.tsx
  components/                       UI, split client/server
  lib/
    supabase.ts                     server-only client
    queries.ts                      all reads, always project-scoped
    actions.ts                      all writes, always project-scoped ("use server")
    action-state.ts                 ActionState / idleState (see below)
    types.ts                        row types + Database generic
    format.ts                       money and date formatting
scripts/check-supabase.mjs          `npm run check:supabase`
supabase/schema.sql                 run this once
```

Database logic lives entirely in `src/lib/`. Components receive plain data and
call Server Actions; none of them build queries.

### Three things that will bite you

- The row types in `types.ts` are **`type` aliases, not `interface`s**, and
  that is load-bearing. postgrest-js requires each `Row` to satisfy
  `Record<string, unknown>`, and TypeScript only gives implicit index
  signatures to type aliases. Change one to `interface` and
  `Database["public"]` stops matching `GenericSchema`, at which point every
  query silently resolves to `never`.
- Each table and view needs a `Relationships` key for the same reason. They are
  empty arrays here because joins happen in SQL, inside the views.
- `actions.ts` has `"use server"`, so it may **only export async functions**.
  The `ActionState` type and the `idleState` constant therefore live in
  `action-state.ts` — a plain module both the actions and the client
  components import. `next build` does not flag a stray non-function export
  here; only the dev/runtime action loader does, with
  *"a 'use server' file can only export async functions"*.

---

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build (also typechecks)
npm run start    # serve the production build
npm run lint     # eslint
```

---

## Dates and money

Dates are handled as plain `YYYY-MM-DD` strings and never passed through
`new Date("YYYY-MM-DD")`, which parses as UTC and would shift every date back a
day in Pakistan (UTC+5). Money uses `numeric(14,2)` / `numeric(16,2)` in
Postgres and is rendered with tabular figures so columns line up.
