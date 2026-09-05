"use client";

import { useEffect } from "react";

import { btn } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        The page could not be loaded. If this keeps happening, check that
        Supabase is reachable and that the schema has been run.
      </p>
      <p className="mt-3 max-w-full break-words rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-ink-2">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className={`${btn.base} ${btn.primary} mt-6`}
      >
        Try again
      </button>
    </div>
  );
}
