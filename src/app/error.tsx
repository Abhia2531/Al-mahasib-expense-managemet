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
    <div className="mx-auto flex min-h-[calc(100dvh-14rem)] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 text-[13px] text-muted">
        The page could not be loaded. If this keeps happening, check that
        Supabase is reachable and the setup is complete.
      </p>
      <p className="mt-3 max-w-full break-words rounded-md border border-l-2 border-border border-l-neg bg-surface px-3 py-2 font-mono text-[11.5px] text-ink-2">
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
