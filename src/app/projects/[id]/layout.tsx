import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectFinancials } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { ProjectTabs } from "@/components/ProjectTabs";
import { SetupNotice } from "@/components/SetupNotice";

/**
 * Wraps every section of one project. It resolves the project once, so the
 * header and tabs below always describe the project in the URL — that is what
 * makes "all sections work with the currently selected project" automatic.
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
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <SetupNotice
          detail={error instanceof Error ? error.message : String(error)}
        />
      </div>
    );
  }

  if (!project) notFound();

  const meta = [
    project.client_name,
    project.location,
    project.start_date ? `Started ${formatDate(project.start_date)}` : null,
  ].filter(Boolean);

  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
          >
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 3.5L5 8l4.5 4.5" />
            </svg>
            All projects
          </Link>

          <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-ink">
            {project.project_name}
          </h1>
          {meta.length > 0 ? (
            <p className="mt-1 text-sm text-muted">{meta.join(" · ")}</p>
          ) : null}

          <div className="mt-4 border-b border-border">
            <ProjectTabs projectId={id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8">{children}</div>
    </>
  );
}
