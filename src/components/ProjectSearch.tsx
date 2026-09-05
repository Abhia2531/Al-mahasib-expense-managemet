"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Live project search. Rewrites `?q=` (replace, not push, so the back button
 * does not walk through every keystroke) and lets the server component
 * re-query. Debounced so typing does not fire a request per character.
 */
export function ProjectSearch({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `/?${query}` : "/", { scroll: false });
      });
    }, 250);

    return () => clearTimeout(timer);
    // `searchParams` is intentionally omitted: including it would re-run this
    // effect from the navigation it just caused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5L14 14" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search projects or clients…"
        aria-label="Search projects"
        className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-muted focus:border-accent outline-none"
      />
      {isPending ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-border-strong border-t-accent"
        />
      ) : null}
    </div>
  );
}
