"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Icon, icons } from "@/components/ui";

/**
 * Search every purchase in the project by item name. Writes `?find=` (replace,
 * so Back does not walk each keystroke); the server component renders the
 * results. Forgiving — partial words, any order, any case.
 */
export function ExpenseSearch({
  projectId,
  initial = "",
}: {
  projectId: string;
  initial?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const first = useRef(true);
  const base = `/projects/${projectId}/expenses`;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("find", trimmed);
      else params.delete("find");
      const q = params.toString();
      startTransition(() => {
        router.replace(q ? `${base}?${q}` : base, { scroll: false });
      });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, router]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
        <Icon path={icons.search} size={16} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search expenses — e.g. cement, paint, labour…"
        aria-label="Search expenses by item name"
        autoComplete="off"
        spellCheck={false}
        className="h-11 w-full rounded-md border border-border-strong bg-surface pl-9 pr-10 text-[15px] text-ink placeholder:text-faint outline-none transition-colors focus:border-steel focus:ring-[3px] focus:ring-steel/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {isPending ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border-strong border-t-steel" />
          ) : (
            <Icon path={<path d="M4 4l8 8M12 4l-8 8" />} size={14} />
          )}
        </button>
      ) : null}
    </div>
  );
}
