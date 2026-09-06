import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";

import { getProjectFinancials } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { ProjectTabs } from "@/components/ProjectTabs";
import { SetupNotice } from "@/components/SetupNotice";
import { Icon, icons } from "@/components/ui";

/**
 * Wraps every section of one project — resolves the project once so the
 * header and tabs always describe the project in the URL.
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
  ].filter(Boolean);

  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1100px] px-4 pt-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            <Icon path={icons.chevronLeft} size={13} />
            Projects
          </Link>

          <h1 className="mt-2 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {project.project_name}
          </h1>
          {meta.length > 0 ? (
            <p className="mt-1 text-[12.5px] text-muted">
              {meta.join("  ·  ")}
            </p>
          ) : null}

          <div className="mt-3.5 border-b border-border">
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
