import type { ReactNode } from "react";

import { formatMoney } from "@/lib/format";

/* Presentational primitives. No hooks — both Server and Client Components
   import this file. Colour is used for meaning: brand actions, status,
   key figures, links. Structure still leans on hairlines and weight. */

/* ---- buttons ------------------------------------------------------- */

export const btn = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium " +
    "whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] " +
    "duration-150 active:translate-y-px select-none " +
    "disabled:pointer-events-none disabled:opacity-50",
  primary:
    "h-10 px-4 bg-brand text-on-brand shadow-[var(--shadow-sm)] hover:bg-brand-hover",
  secondary:
    "h-10 px-4 border border-border-strong bg-surface text-ink hover:bg-surface-2 hover:border-ink-2/30",
  steel: "h-10 px-4 bg-steel text-white shadow-[var(--shadow-sm)] hover:bg-steel-hover",
  ghost: "h-10 px-3 text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger:
    "h-10 px-4 border border-neg/35 bg-surface text-neg hover:bg-neg-soft",
  dangerSolid: "h-10 px-4 bg-neg text-white hover:brightness-95",
  sm: "h-8 px-3 text-[13px] gap-1.5",
  lg: "h-11 px-5 text-[15px]",
} as const;

/* ---- inputs ------------------------------------------------------- */

export const input =
  "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm " +
  "text-ink placeholder:text-faint outline-none transition-colors " +
  "focus:border-steel focus:ring-[3px] focus:ring-steel/20 " +
  "disabled:opacity-50 disabled:bg-surface-2";

export const textarea =
  "w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm " +
  "text-ink placeholder:text-faint outline-none transition-colors resize-y min-h-[80px] " +
  "focus:border-steel focus:ring-[3px] focus:ring-steel/20";

export const label = "block text-[13px] font-medium text-ink-2 mb-1.5";

export const tableCls = {
  head: "text-[11px] font-semibold uppercase tracking-[0.05em] text-faint",
  headCell: "px-3 py-2 text-left font-semibold",
  cell: "px-3 py-2.5 align-middle text-sm",
} as const;

/* ---- containers -------------------------------------------------- */

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
          <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {title}
          </h1>
          {lead ? (
            <p className="mt-1.5 max-w-prose text-sm text-muted">{lead}</p>
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
    <div className="mb-3 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap xs:items-end xs:justify-between xs:gap-x-4">
      <div className="min-w-0">
        <h2
          id={id}
          className="text-[16px] font-semibold tracking-[-0.01em] text-ink"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 flex-wrap gap-2 [&>*]:flex-1 xs:[&>*]:flex-none">
          {action}
        </div>
      ) : null}
    </div>
  );
}

/* ---- figures ---------------------------------------------------- */

type Tone = "neutral" | "pos" | "neg" | "warn" | "brand" | "steel";

const toneText: Record<Tone, string> = {
  neutral: "text-ink",
  pos: "text-pos",
  neg: "text-neg",
  warn: "text-warn",
  brand: "text-brand",
  steel: "text-steel",
};

const toneFill: Record<Tone, string> = {
  neutral: "bg-surface",
  pos: "bg-pos-soft",
  neg: "bg-neg-soft",
  warn: "bg-warn-soft",
  brand: "bg-brand-soft",
  steel: "bg-steel-soft",
};

export interface FigureSpec {
  label: string;
  value: number | string;
  hint?: string;
  tone?: Tone;
  lead?: boolean;
}

/**
 * A band of related figures. A hairline grid; the `lead` figure sits larger
 * and, when it has a tone, on a soft tint so the number a user needs most is
 * obvious at a glance.
 */
export function Figures({ items }: { items: FigureSpec[] }) {
  // One column on small phones so long money values never wrap or clip;
  // two from 400px; the full row only where the cells are wide enough.
  const cols =
    items.length === 3
      ? "sm:grid-cols-3"
      : items.length === 2
        ? "xs:grid-cols-2"
        : "xs:grid-cols-2 lg:grid-cols-4";
  return (
    <dl
      className={`grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border ${cols}`}
    >
      {items.map((item) => {
        const tone = item.tone ?? "neutral";
        const display =
          typeof item.value === "number" ? formatMoney(item.value) : item.value;
        return (
          <div
            key={item.label}
            className={`px-4 py-3.5 ${
              item.lead && tone !== "neutral" ? toneFill[tone] : "bg-surface"
            }`}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">
              {item.label}
            </dt>
            <dd
              className={`tnum mt-1 font-semibold leading-tight ${
                item.lead
                  ? "text-[22px] sm:text-[24px]"
                  : "text-[17px] sm:text-[18px]"
              } ${toneText[tone]}`}
            >
              {display}
            </dd>
            {item.hint ? (
              <dd className="mt-0.5 text-[12px] text-muted">{item.hint}</dd>
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
  tone?: Tone;
}) {
  const styles: Record<Tone, string> = {
    neutral: "bg-surface-2 text-ink-2 border-border-strong",
    brand: "bg-brand-soft text-brand border-brand/30",
    steel: "bg-steel-soft text-steel border-steel/30",
    pos: "bg-pos-soft text-pos border-pos/30",
    neg: "bg-neg-soft text-neg border-neg/30",
    warn: "bg-warn-soft text-warn border-warn/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11.5px] font-semibold leading-4 ${styles[tone]}`}
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
        className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-brand/25 bg-brand-soft text-brand"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-5h6v5" />
          <path d="M9 12h.01M15 12h.01" />
        </svg>
      </span>
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-md border border-neg/30 bg-neg-soft px-3 py-2 text-sm text-neg"
    >
      {children}
    </p>
  );
}

export function Note({
  children,
  tone = "warn",
}: {
  children: ReactNode;
  tone?: "pos" | "neg" | "warn" | "steel";
}) {
  const styles = {
    pos: "border-pos/30 bg-pos-soft text-pos",
    neg: "border-neg/30 bg-neg-soft text-ink-2",
    warn: "border-warn/30 bg-warn-soft text-ink-2",
    steel: "border-steel/30 bg-steel-soft text-ink-2",
  }[tone];
  return (
    <p className={`rounded-md border px-3.5 py-2.5 text-sm ${styles}`}>
      {children}
    </p>
  );
}

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
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

/* ---- icons — one stroke weight ---------------------------------- */

export function Icon({
  path,
  size = 16,
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
  edit: <path d="M11 2.5 13.5 5 5 13.5H2.5V11z" />,
  printer: (
    <>
      <path d="M4 6V2.5h8V6M4 12H2.5V6.5h11V12H12" />
      <path d="M4 9.5h8V14H4z" />
    </>
  ),
  warning: <path d="M8 2 1.5 13.5h13zM8 6.5v3.5M8 12h.01" />,
} as const;
