import type { ReactNode } from "react";

import { formatMoney } from "@/lib/format";

/* Presentational primitives. No hooks — both Server and Client Components
   import this file. Hierarchy comes from hairlines, weight and space; colour
   is reserved for meaning, never decoration. */

/* ---- buttons ------------------------------------------------------- */

export const btn = {
  base:
    "inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium " +
    "whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 " +
    "active:translate-y-px select-none disabled:pointer-events-none disabled:opacity-45",
  primary: "h-9 px-3.5 bg-ink text-bg hover:bg-ink-2",
  secondary:
    "h-9 px-3.5 border border-border-strong bg-surface text-ink hover:bg-surface-2",
  ghost: "h-9 px-3 text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "h-9 px-3 text-neg hover:bg-surface-2",
  sm: "h-8 px-2.5 text-[12px]",
  lg: "h-10 px-4 text-sm",
} as const;

/* ---- inputs ------------------------------------------------------- */

export const input =
  "h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-[13px] " +
  "text-ink placeholder:text-faint outline-none transition-colors " +
  "focus:border-accent focus:ring-[3px] focus:ring-accent/15 " +
  "disabled:opacity-50 disabled:bg-surface-2";

export const textarea =
  "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-[13px] " +
  "text-ink placeholder:text-faint outline-none transition-colors resize-y min-h-[76px] " +
  "focus:border-accent focus:ring-[3px] focus:ring-accent/15";

export const label = "block text-[12.5px] font-medium text-ink-2 mb-1.5";

/* shared <table> class fragments so every data table reads the same */
export const table = {
  head: "text-[11px] font-semibold uppercase tracking-[0.06em] text-faint",
  headCell: "px-3 py-2 text-left font-semibold",
  cell: "px-3 py-2.5 align-middle",
  row: "border-t border-border",
} as const;

/* ---- containers -------------------------------------------------- */

/** A quiet panel. Hairline border, faint shadow — use only where a real
 *  surface break helps (forms, login). Most layouts use bare sections. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  lead,
  actions,
  back,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {back ? <div className="mb-3">{back}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {title}
          </h1>
          {lead ? (
            <p className="mt-1 max-w-prose text-[13px] text-muted">{lead}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <h2
          id={id}
          className="text-[15px] font-semibold tracking-[-0.01em] text-ink"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ---- figures (replaces the old stat-tile grid) ------------------- */

type Tone = "neutral" | "pos" | "neg" | "warn";

const toneText: Record<Tone, string> = {
  neutral: "text-ink",
  pos: "text-pos",
  neg: "text-neg",
  warn: "text-warn",
};

export interface FigureSpec {
  label: string;
  value: number | string;
  hint?: string;
  tone?: Tone;
  lead?: boolean;
}

/**
 * A band of related figures. Borderless; a hairline top rule and thin column
 * dividers do the work. One figure may be marked `lead` to sit larger.
 */
export function Figures({ items }: { items: FigureSpec[] }) {
  // Odd counts leave a hole on a 2-col mobile grid — let the last cell span.
  const cols =
    items.length === 3
      ? "sm:grid-cols-3 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1"
      : items.length === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-4";
  return (
    <dl
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border ${cols}`}
    >
      {items.map((item) => {
        const display =
          typeof item.value === "number" ? formatMoney(item.value) : item.value;
        return (
          <div key={item.label} className="bg-surface px-4 py-3.5">
            <dt className="text-[11px] font-medium uppercase tracking-[0.05em] text-faint">
              {item.label}
            </dt>
            <dd
              className={`tnum mt-1 font-semibold leading-tight ${
                item.lead ? "text-[22px]" : "text-[17px]"
              } ${toneText[item.tone ?? "neutral"]}`}
            >
              {display}
            </dd>
            {item.hint ? (
              <dd className="mt-0.5 text-[11.5px] text-muted">{item.hint}</dd>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}

/* ---- small parts ------------------------------------------------- */

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone | "accent";
}) {
  const styles: Record<string, string> = {
    neutral: "border-border-strong text-muted",
    accent: "border-accent/40 text-accent",
    pos: "border-pos/40 text-pos",
    neg: "border-neg/40 text-neg",
    warn: "border-warn/40 text-warn",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-px text-[11px] font-medium leading-4 ${styles[tone]}`}
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
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-border text-faint"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3h8l4 4v10H4z" />
          <path d="M12 3v4h4M7 11h6M7 14h4" />
        </svg>
      </span>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-[13px] text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Inline error. `aria-live` so async validation is announced. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-md border border-l-2 border-border border-l-neg bg-surface px-3 py-2 text-[13px] text-ink-2"
    >
      {children}
    </p>
  );
}

/** A hairline-left callout for non-error notes (e.g. overspend). */
export function Note({
  children,
  tone = "warn",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const rule = {
    neutral: "border-l-border-strong",
    pos: "border-l-pos",
    neg: "border-l-neg",
    warn: "border-l-warn",
  }[tone];
  return (
    <p
      className={`rounded-md border border-l-2 border-border ${rule} bg-surface px-3 py-2 text-[13px] text-ink-2`}
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
      {hint ? <p className="mt-1 text-[11.5px] text-muted">{hint}</p> : null}
    </div>
  );
}

/* ---- icons — one stroke weight, used sparingly ------------------- */

export function Icon({
  path,
  size = 15,
  className = "",
}: {
  path: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}

export const icons = {
  plus: <path d="M8 3.5v9M3.5 8h9" />,
  chevronLeft: <path d="M9.5 3.5 5 8l4.5 4.5" />,
  chevronRight: <path d="m6.5 3.5 4.5 4.5-4.5 4.5" />,
  arrowRight: <path d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4" />
      <path d="m10.5 10.5 3 3" />
    </>
  ),
  trash: <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8h5.8l.6-8" />,
} as const;
