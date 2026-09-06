/**
 * Shown instead of a stack trace when Supabase is not reachable — usually a
 * missing env var, an un-applied schema, or missing policies.
 */
export function SetupNotice({ detail }: { detail?: string }) {
  const text = detail ?? "";
  const permissionDenied = /permission denied|42501|row-level security/i.test(text);
  const schemaMissing = /could not find the table|PGRST205/i.test(text);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="border-b border-border border-l-2 border-l-warn px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-warn">
          Supabase setup incomplete
        </h2>
      </div>

      <div className="space-y-3.5 px-4 py-4 text-[13px] text-ink-2">
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
            <p>
              Finish the setup in <Code>README.md</Code>:
            </p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>
                <Code>NEXT_PUBLIC_SUPABASE_URL</Code> and{" "}
                <Code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</Code> in{" "}
                <Code>.env</Code>
              </li>
              <li>
                run <Code>supabase/schema.sql</Code>
              </li>
              <li>
                run <Code>supabase/auth-policies.sql</Code>
              </li>
              <li>
                add a user under <Strong>Authentication → Users</Strong>
              </li>
            </ol>
            <p className="text-[11.5px] text-muted">
              <Code>npm run check:supabase</Code> reports what is outstanding.
            </p>
          </>
        )}

        {detail ? (
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.05em] text-faint">
              Error reported
            </p>
            <p className="mt-1 rounded-md border border-border bg-surface-2 px-2.5 py-2 font-mono text-[11.5px] break-words text-ink-2">
              {detail}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-ink">{children}</span>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      translate="no"
      className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px]"
    >
      {children}
    </code>
  );
}
