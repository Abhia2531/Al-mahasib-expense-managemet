import { Suspense } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { listProjects } from "@/lib/queries";
import { formatDate, formatMoneyCompact } from "@/lib/format";
import { ProjectSearch } from "@/components/ProjectSearch";
import { SetupNotice } from "@/components/SetupNotice";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import {
  Badge,
  btn,
  EmptyState,
  Icon,
  icons,
  Note,
} from "@/components/ui";
import { DashboardHero } from "@/components/DashboardHero";
import type { ProjectFinancials } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const search = typeof params?.q === "string" ? params.q : "";
  const justDeleted = params?.deleted === "1";

  let projects: ProjectFinancials[] = [];
  let loadError: string | null = null;

  try {
    projects = await listProjects(search);
  } catch (error) {
    unstable_rethrow(error);
    loadError = error instanceof Error ? error.message : String(error);
  }

  const totals = summarise(projects);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 sm:py-9">
      <DashboardHero
        projectCount={projects.length}
        totalRemaining={totals.remaining}
        totalOutstanding={totals.outstanding}
        hasSearch={Boolean(search)}
        errored={Boolean(loadError)}
      />

      {loadError ? (
        <SetupNotice detail={loadError} />
      ) : (
        <>
          {justDeleted ? (
            <div className="mb-4">
              <Note tone="pos">Project deleted.</Note>
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Suspense fallback={<div className="h-10 w-full sm:max-w-sm" />}>
              <ProjectSearch initial={search} />
            </Suspense>
            {projects.length > 0 ? (
              <p className="tnum text-[13px] text-muted">
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
                      <Icon path={icons.plus} size={16} />
                      New project
                    </Link>
                  )
                }
              />
            </div>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]">
              {projects.map((project) => (
                <li
                  key={project.project_id}
                  className="border-t border-border first:border-t-0"
                >
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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 transition-colors hover:bg-surface-2">
      <div className="min-w-[12rem] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${project.project_id}`}
            className="text-[15px] font-semibold text-ink underline-offset-2 hover:text-brand hover:underline"
          >
            {project.project_name}
          </Link>
          {overspent ? <Badge tone="neg">Over advance</Badge> : null}
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-muted">
          {meta.join("  ·  ")}
        </p>
      </div>

      <dl className="flex shrink-0 items-baseline gap-5 sm:gap-7">
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

      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={`/projects/${project.project_id}/edit`}
          className={`${btn.base} ${btn.secondary} ${btn.sm}`}
        >
          <Icon path={icons.edit} size={13} />
          Edit
        </Link>
        <DeleteProjectDialog
          projectId={project.project_id}
          projectName={project.project_name}
          triggerClassName={`${btn.base} ${btn.danger} ${btn.sm}`}
          triggerLabel="Delete"
        />
        <Link
          href={`/projects/${project.project_id}`}
          aria-label={`Open ${project.project_name}`}
          className="grid h-8 w-8 place-items-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-ink"
        >
          <Icon path={icons.chevronRight} size={15} />
        </Link>
      </div>
    </div>
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
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-faint">
        {label}
      </dt>
      <dd className={`tnum mt-0.5 text-[13px] font-semibold ${toneClass}`}>
        {value}
      </dd>
    </div>
  );
}

function summarise(projects: ProjectFinancials[]) {
  return projects.reduce(
    (acc, p) => ({
      remaining: acc.remaining + p.remaining_advance,
      outstanding: acc.outstanding + p.outstanding_billing,
    }),
    { remaining: 0, outstanding: 0 },
  );
}
