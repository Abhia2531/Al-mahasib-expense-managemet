"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Icon, icons } from "@/components/ui";

/**
 * Live project search. Rewrites `?q=` (replace, not push, so Back does not
 * walk every keystroke) and lets the server component re-query. Debounced.
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
    // searchParams intentionally omitted — it changes from the nav we cause.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
        <Icon path={icons.search} size={14} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search projects, clients…"
        aria-label="Search projects"
        autoComplete="off"
        spellCheck={false}
        className="h-10 w-full rounded-md border border-border-strong bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-steel focus:ring-[3px] focus:ring-steel/20"
      />
      {isPending ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-border-strong border-t-steel"
        />
      ) : null}
    </div>
  );
}
