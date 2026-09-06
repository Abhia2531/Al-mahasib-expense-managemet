import Link from "next/link";

/** Wordmark. A ruled-ledger glyph in ink + the name. Links home. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5"
      aria-label="Al Mahasib, go to projects"
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border-strong bg-surface text-ink"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M3 3.5h10M3 8h10M3 12.5h6" />
          <path d="M11.5 11 13 12.5 11.5 14" opacity="0.55" />
        </svg>
      </span>
      <span className="text-[14px] font-semibold tracking-[-0.02em] text-ink">
        Al&nbsp;Mahasib
      </span>
    </Link>
  );
}
