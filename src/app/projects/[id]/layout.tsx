import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";

import { getProjectFinancials } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { ProjectTabs } from "@/components/ProjectTabs";
import { SetupNotice } from "@/components/SetupNotice";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import { btn, Icon, icons } from "@/components/ui";

/**
 * Wraps every section of one project — resolves the project once so the
 * header, its Edit / Print / Delete actions and the tabs all describe the
 * project in the URL.
 */
export default async function ProjectLayout({
  children,
  params,
}: LayoutProps<"/projects/[id]">) {
  const { id } = await params;

  let project;
  try {
    project = await getProjectFinancials(id);
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <SetupNotice
          detail={error instanceof Error ? error.message : String(error)}
        />
      </div>
    );
  }

  if (!project) notFound();

  const meta = [
    project.client_name || null,
    project.location || null,
    project.start_date ? `Started ${formatDate(project.start_date)}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const deleteSummary = summarise(project.expense_days, project.bill_count);

  return (
    <>
      <div className="border-b border-border bg-surface" data-noprint>
        <div className="mx-auto max-w-[1100px] px-4 pt-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] text-steel transition-colors hover:text-steel-hover"
          >
            <Icon path={icons.chevronLeft} size={13} />
            All projects
          </Link>

          <div className="mt-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink">
                {project.project_name}
              </h1>
              {meta ? (
                <p className="mt-1 text-[13px] text-muted">{meta}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/projects/${id}/edit`}
                className={`${btn.base} ${btn.secondary} ${btn.sm}`}
              >
                <Icon path={icons.edit} size={14} />
                Edit project
              </Link>
              <Link
                href={`/projects/${id}/reports`}
                className={`${btn.base} ${btn.steel} ${btn.sm}`}
              >
                <Icon path={icons.printer} size={14} />
                Print report
              </Link>
              <DeleteProjectDialog
                projectId={id}
                projectName={project.project_name}
                summary={deleteSummary}
                triggerClassName={`${btn.base} ${btn.danger} ${btn.sm}`}
              />
            </div>
          </div>

          <div className="mt-4">
            <ProjectTabs projectId={id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 sm:py-8">
        {children}
      </div>
    </>
  );
}

function summarise(expenseDays: number, billCount: number): string {
  const parts: string[] = [];
  if (expenseDays > 0)
    parts.push(
      `all expenses across ${expenseDays} ${expenseDays === 1 ? "day" : "days"}`,
    );
  if (billCount > 0)
    parts.push(`${billCount} progress ${billCount === 1 ? "bill" : "bills"}`);
  parts.push("every advance payment");
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
