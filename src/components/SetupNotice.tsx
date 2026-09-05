import { Card } from "@/components/ui";

/**
 * Shown instead of a stack trace when the app cannot reach Supabase —
 * almost always a missing/invalid key or a schema that has not been run yet.
 */
export function SetupNotice({ detail }: { detail?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-warn-soft px-5 py-3">
        <h2 className="text-sm font-semibold text-warn">
          Not connected to Supabase yet
        </h2>
      </div>

      <div className="space-y-5 px-5 py-5 text-sm text-ink-2">
        <p>Two things need to be in place before any data can load:</p>

        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              1
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink">Add real API keys</p>
              <p className="mt-0.5">
                In the Supabase dashboard open{" "}
                <span className="font-medium text-ink">
                  Project Settings → API Keys
                </span>
                , then put the values in{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px]">
                  .env
                </code>{" "}
                and restart the dev server:
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[12px] leading-relaxed">
                {`SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...`}
              </pre>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              2
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink">Create the tables</p>
              <p className="mt-0.5">
                Open{" "}
                <span className="font-medium text-ink">SQL Editor → New query</span>{" "}
                in Supabase, paste the contents of{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px]">
                  supabase/schema.sql
                </code>{" "}
                and run it once.
              </p>
            </div>
          </li>
        </ol>

        {detail ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Error reported
            </p>
            <p className="mt-1 rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-[12px] break-words text-ink-2">
              {detail}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
