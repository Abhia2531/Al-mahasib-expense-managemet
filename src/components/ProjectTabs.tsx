"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Section navigation inside a project. Every href is built from the project id
 * in the URL, so switching sections never changes which project is shown.
 */
export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const tabs = [
    { href: base, label: "Dashboard" },
    { href: `${base}/expenses`, label: "Daily expenses" },
    { href: `${base}/advances`, label: "Advances" },
    { href: `${base}/billing`, label: "Billing" },
    { href: `${base}/reports`, label: "Report" },
  ];

  return (
    <nav
      aria-label="Project sections"
      className="overflow-x-auto border-b border-border"
    >
      <ul className="flex min-w-max gap-6">
        {tabs.map((tab) => {
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
                  "relative inline-block whitespace-nowrap py-2.5 text-[13.5px] font-medium transition-colors " +
                  (active
                    ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-brand"
                    : "text-muted hover:text-ink")
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
