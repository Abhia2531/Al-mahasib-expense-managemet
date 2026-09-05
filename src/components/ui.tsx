import type { ReactNode } from "react";

import { formatMoney } from "@/lib/format";

/* Presentational primitives. No hooks here, so both Server and Client
   Components can import this file. */

export const btn = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium " +
    "transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none",
  primary:
    "bg-accent text-white hover:bg-accent-hover px-4 h-10 shadow-sm " +
    "disabled:hover:bg-accent",
  secondary:
    "bg-surface text-ink border border-border-strong hover:bg-surface-2 px-4 h-10",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink px-3 h-9",
  danger: "text-neg hover:bg-neg-soft px-3 h-9",
  small: "h-8 px-3 text-[13px]",
} as const;

export const input =
  "w-full h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm " +
  "text-ink placeholder:text-muted focus:border-accent outline-none";

export const label = "block text-[13px] font-medium text-ink-2 mb-1.5";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(16,23,32,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {description ? (
          <p className="text-sm text-muted mt-0.5">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type Tone = "neutral" | "accent" | "pos" | "neg" | "warn";

const toneValue: Record<Tone, string> = {
  neutral: "text-ink",
  accent: "text-accent",
  pos: "text-pos",
  neg: "text-neg",
  warn: "text-warn",
};

/**
 * One figure on the dashboard. `hint` carries the formula, so the numbers
 * explain themselves rather than needing a legend.
 */
export function StatTile({
  label: statLabel,
  value,
  hint,
  tone = "neutral",
  emphasis = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: Tone;
  emphasis?: boolean;
}) {
  const display = typeof value === "number" ? formatMoney(value) : value;
  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (emphasis
          ? "border-accent/30 bg-accent-soft"
          : "border-border bg-surface")
      }
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {statLabel}
      </div>
      <div
        className={`tnum mt-1.5 text-[22px] font-semibold leading-tight ${toneValue[tone]}`}
      >
        {display}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const styles: Record<Tone, string> = {
    neutral: "bg-surface-2 text-ink-2 border-border",
    accent: "bg-accent-soft text-accent border-accent/25",
    pos: "bg-pos-soft text-pos border-pos/25",
    neg: "bg-neg-soft text-neg border-neg/25",
    warn: "bg-warn-soft text-warn border-warn/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-neg/25 bg-neg-soft px-3 py-2 text-sm text-neg"
    >
      {children}
    </p>
  );
}

/** Label + optional hint wrapped around a form control. */
export function Field({
  htmlFor,
  label: fieldLabel,
  hint,
  children,
  className = "",
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={label}>
        {fieldLabel}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
