import { Suspense } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { listProjects } from "@/lib/queries";
import { formatDate, formatMoneyCompact } from "@/lib/format";
import { ProjectSearch } from "@/components/ProjectSearch";
import { SetupNotice } from "@/components/SetupNotice";
import {
  Badge,
  btn,
  EmptyState,
  Icon,
  icons,
  PageHeader,
} from "@/components/ui";
import type { ProjectFinancials } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const raw = params?.q;
  const search = typeof raw === "string" ? raw : "";

  let projects: ProjectFinancials[] = [];
  let loadError: string | null = null;

  try {
    projects = await listProjects(search);
  } catch (error) {
    unstable_rethrow(error);
    loadError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Projects"
        lead="Every expense, advance and bill is scoped to one project."
        actions={
          <Link href="/projects/new" className={`${btn.base} ${btn.primary} ${btn.lg}`}>
            <Icon path={icons.plus} size={15} />
            New project
          </Link>
        }
      />

      {loadError ? (
        <SetupNotice detail={loadError} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Suspense fallback={<div className="h-9 w-full sm:max-w-xs" />}>
              <ProjectSearch initial={search} />
            </Suspense>
            {projects.length > 0 ? (
              <p className="tnum text-[12.5px] text-muted">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
                {search ? " matched" : ""}
              </p>
            ) : null}
          </div>

          {projects.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface">
              <EmptyState
                title={search ? `Nothing matches “${search}”` : "No projects yet"}
                description={
                  search
                    ? "Try a different name, client or location."
                    : "Create the first project to start recording daily expenses, advances and bills."
                }
                action={
                  search ? (
                    <Link href="/" className={`${btn.base} ${btn.secondary}`}>
                      Clear search
                    </Link>
                  ) : (
                    <Link
                      href="/projects/new"
                      className={`${btn.base} ${btn.primary}`}
                    >
                      Create a project
                    </Link>
                  )
                }
              />
            </div>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-surface">
              {projects.map((project) => (
                <li key={project.project_id} className="border-t border-border first:border-t-0">
                  <ProjectRow project={project} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ProjectRow({ project }: { project: ProjectFinancials }) {
  const overspent = project.remaining_advance < 0;
  const meta = [
    project.client_name || null,
    project.location || null,
    project.start_date
      ? `Started ${formatDate(project.start_date)}`
      : `Added ${formatDate(project.created_at.slice(0, 10))}`,
  ].filter(Boolean);

  return (
    <Link
      href={`/projects/${project.project_id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium text-ink">
            {project.project_name}
          </span>
          {overspent ? <Badge tone="neg">Over advance</Badge> : null}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted">
          {meta.join("  ·  ")}
        </p>
      </div>

      <dl className="hidden shrink-0 items-baseline gap-6 sm:flex">
        <RowFigure
          label="Remaining"
          value={formatMoneyCompact(project.remaining_advance)}
          tone={overspent ? "neg" : "pos"}
        />
        <RowFigure
          label="Outstanding"
          value={formatMoneyCompact(project.outstanding_billing)}
          tone={project.outstanding_billing > 0 ? "warn" : "neutral"}
        />
        <RowFigure
          label="Value"
          value={formatMoneyCompact(project.contract_value)}
        />
      </dl>

      <span className="shrink-0 text-faint transition-colors group-hover:text-ink-2">
        <Icon path={icons.chevronRight} size={15} />
      </span>
    </Link>
  );
}

function RowFigure({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "pos" | "neg" | "warn";
}) {
  const toneClass = {
    neutral: "text-ink-2",
    pos: "text-pos",
    neg: "text-neg",
    warn: "text-warn",
  }[tone];
  return (
    <div className="text-right">
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.05em] text-faint">
        {label}
      </dt>
      <dd className={`tnum mt-0.5 text-[13px] font-semibold ${toneClass}`}>
        {value}
      </dd>
    </div>
  );
}
