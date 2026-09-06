import { Suspense } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { listProjects } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { ProjectSearch } from "@/components/ProjectSearch";
import { SetupNotice } from "@/components/SetupNotice";
import { Badge, btn, Card, EmptyState } from "@/components/ui";
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
    unstable_rethrow(error); // let redirect()/notFound() through
    loadError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted">
            Each project keeps its own expenses, advances and billing.
          </p>
        </div>
        <Link href="/projects/new" className={`${btn.base} ${btn.primary}`}>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M8 3.5v9M3.5 8h9" />
          </svg>
          New Project
        </Link>
      </div>

      {loadError ? (
        <SetupNotice detail={loadError} />
      ) : (
        <>
          <div className="mb-5">
            <Suspense fallback={<div className="h-10 w-full sm:max-w-xs" />}>
              <ProjectSearch initial={search} />
            </Suspense>
          </div>

          {projects.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  search ? `No projects match “${search}”` : "No projects yet"
                }
                description={
                  search
                    ? "Try a different project name, client or location."
                    : "Create your first project to start recording daily expenses, advances and progress bills."
                }
                action={
                  search ? (
                    <Link
                      href="/"
                      className={`${btn.base} ${btn.secondary}`}
                    >
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
            </Card>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
                {search ? ` matching “${search}”` : ""}
              </p>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <li key={project.project_id}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectFinancials }) {
  const overspent = project.remaining_advance < 0;

  return (
    <Link
      href={`/projects/${project.project_id}`}
      className="group block h-full rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(16,23,32,0.04)] transition-colors hover:border-accent/40 hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-ink group-hover:text-accent">
            {project.project_name}
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted">
            {project.client_name || "No client recorded"}
          </p>
        </div>
        {overspent ? <Badge tone="neg">Over advance</Badge> : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-3.5">
        <Figure label="Project value" value={formatMoney(project.contract_value)} />
        <Figure label="Total expenses" value={formatMoney(project.total_expenses)} />
        <Figure
          label="Remaining advance"
          value={formatMoney(project.remaining_advance)}
          tone={overspent ? "neg" : "pos"}
        />
        <Figure
          label="Outstanding billing"
          value={formatMoney(project.outstanding_billing)}
          tone={project.outstanding_billing > 0 ? "warn" : "neutral"}
        />
      </dl>

      <p className="mt-3.5 border-t border-border pt-3 text-xs text-muted">
        {project.location ? `${project.location} · ` : ""}
        {project.start_date
          ? `Started ${formatDate(project.start_date)}`
          : `Added ${formatDate(project.created_at.slice(0, 10))}`}
      </p>
    </Link>
  );
}

function Figure({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "pos" | "neg" | "warn";
}) {
  const toneClass = {
    neutral: "text-ink",
    pos: "text-pos",
    neg: "text-neg",
    warn: "text-warn",
  }[tone];

  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className={`tnum mt-0.5 truncate text-sm font-semibold ${toneClass}`}>
        {value}
      </dd>
    </div>
  );
}
