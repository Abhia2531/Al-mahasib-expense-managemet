import Link from "next/link";

/** Wordmark used in the app header. Links home. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-lg"
      aria-label="Al Mahasib — go to home"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white shadow-sm"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* ledger page with a rule and a rising line */}
          <path d="M4 2.5h9.5L16 5v12.5H4z" />
          <path d="M6.6 8.2h6.8M6.6 11h3.2" />
          <path d="M11.4 14.2l1.6-1.9 1.2 1" opacity="0.75" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight text-ink">
            Al Mahasib
          </span>
          <span className="block text-[11px] font-medium tracking-wide text-muted">
            Project Finance
          </span>
        </span>
      )}
    </Link>
  );
}
