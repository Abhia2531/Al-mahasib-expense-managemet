import { Card } from "@/components/ui";

/**
 * Shown instead of a stack trace when Supabase is not reachable — usually a
 * missing env var, an un-applied schema, or missing policies.
 */
export function SetupNotice({ detail }: { detail?: string }) {
  const text = detail ?? "";
  const permissionDenied = /permission denied|42501|row-level security/i.test(text);
  const schemaMissing = /could not find the table|PGRST205/i.test(text);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-warn-soft px-5 py-3">
        <h2 className="text-sm font-semibold text-warn">Supabase setup incomplete</h2>
      </div>

      <div className="space-y-4 px-5 py-5 text-sm text-ink-2">
        {permissionDenied ? (
          <p>
            The database is reachable but the policies are missing. In Supabase,
            open <Strong>SQL Editor → New query</Strong> and run{" "}
            <Code>supabase/auth-policies.sql</Code>, then add your login under{" "}
            <Strong>Authentication → Users</Strong>.
          </p>
        ) : schemaMissing ? (
          <p>
            The tables do not exist yet. In Supabase, open{" "}
            <Strong>SQL Editor → New query</Strong> and run{" "}
            <Code>supabase/schema.sql</Code>, then{" "}
            <Code>supabase/auth-policies.sql</Code>.
          </p>
        ) : (
          <>
            <p>Finish the setup in <Code>README.md</Code>:</p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>
                <Code>NEXT_PUBLIC_SUPABASE_URL</Code> and{" "}
                <Code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</Code> in{" "}
                <Code>.env</Code>
              </li>
              <li>run <Code>supabase/schema.sql</Code></li>
              <li>run <Code>supabase/auth-policies.sql</Code></li>
              <li>add a user under <Strong>Authentication → Users</Strong></li>
            </ol>
            <p className="text-xs text-muted">
              <Code>npm run check:supabase</Code> reports what is outstanding.
            </p>
          </>
        )}

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

function Strong({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-ink">{children}</span>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px]">
      {children}
    </code>
  );
}
