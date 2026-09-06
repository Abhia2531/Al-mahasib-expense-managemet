import Link from "next/link";

import { formatMoneyCompact } from "@/lib/format";
import { btn, Icon, icons } from "@/components/ui";

/**
 * The projects-page header. A blueprint-tinted panel with the primary action
 * and, when there is data, the two numbers that matter most across every
 * project — so the state of the whole book is visible at a glance.
 */
export function DashboardHero({
  projectCount,
  totalRemaining,
  totalOutstanding,
  hasSearch,
  errored,
}: {
  projectCount: number;
  totalRemaining: number;
  totalOutstanding: number;
  hasSearch: boolean;
  errored: boolean;
}) {
  const showTotals = !errored && !hasSearch && projectCount > 0;

  return (
    <section className="relative mb-6 overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]">
      {/* blueprint grid + a light construction motif, brand-tinted, very faint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "linear-gradient(105deg, rgba(0,0,0,0.9), rgba(0,0,0,0) 62%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 hidden h-44 w-44 text-brand/[0.07] xs:block"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* level / theodolite motif */}
        <path d="M6 40h52M12 40v-6h40v6" />
        <circle cx="32" cy="34" r="4" />
        <path d="M32 30V16m-8 0h16M20 52l6-12m18 12-6-12" />
      </svg>

      <div className="relative flex flex-col justify-between gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:gap-x-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Al Mahasib
          </p>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink xs:text-[26px] sm:text-[30px]">
            Construction project finance
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted">
            Daily expenses, advances and progress billing — kept separate for
            every site, every client.
          </p>
          <div className="mt-4">
            <Link
              href="/projects/new"
              className={`${btn.base} ${btn.primary} ${btn.lg} w-full justify-center xs:w-auto`}
            >
              <Icon path={icons.plus} size={16} />
              New project
            </Link>
          </div>
        </div>

        {showTotals ? (
          <dl className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border text-right lg:w-auto">
            <HeroFigure
              label="Remaining advance"
              value={formatMoneyCompact(totalRemaining)}
              tone={totalRemaining < 0 ? "neg" : "pos"}
            />
            <HeroFigure
              label="Outstanding billing"
              value={formatMoneyCompact(totalOutstanding)}
              tone={totalOutstanding > 0 ? "warn" : "neutral"}
            />
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function HeroFigure({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pos" | "neg" | "warn" | "neutral";
}) {
  const toneClass = {
    pos: "text-pos",
    neg: "text-neg",
    warn: "text-warn",
    neutral: "text-ink",
  }[tone];
  return (
    <div className="min-w-0 bg-surface px-4 py-3 lg:min-w-[9rem]">
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-faint">
        {label}
      </dt>
      <dd className={`tnum mt-1 text-[17px] font-semibold xs:text-[19px] ${toneClass}`}>
        {value}
      </dd>
      <dd className="text-[10.5px] text-faint">across all projects</dd>
    </div>
  );
}
