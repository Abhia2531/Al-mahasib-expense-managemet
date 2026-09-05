"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Section navigation inside a project. Every href is built from the current
 * project id, so switching sections can never change which project you are
 * looking at.
 */
export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const tabs = [
    { href: base, label: "Dashboard" },
    { href: `${base}/expenses`, label: "Daily Expenses" },
    { href: `${base}/advances`, label: "Advance Payments" },
    { href: `${base}/billing`, label: "Progress Billing" },
    { href: `${base}/reports`, label: "Reports" },
  ];

  return (
    <nav aria-label="Project sections" className="-mb-px overflow-x-auto">
      <ul className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          // Dashboard is the index route, so it must match exactly; the others
          // stay active on their own nested pages (e.g. a single expense day).
          const active =
            tab.href === base
              ? pathname === base
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={
                  "inline-block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors " +
                  (active
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:border-border-strong hover:text-ink")
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
