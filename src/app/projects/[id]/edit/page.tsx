import type { Metadata } from "next";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";

import { getProject } from "@/lib/queries";
import { todayISO } from "@/lib/format";
import { ProjectForm } from "@/components/ProjectForm";
import { Card, Icon, icons, PageHeader } from "@/components/ui";
import { SetupNotice } from "@/components/SetupNotice";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]/edit">): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id).catch((e) => {
    unstable_rethrow(e);
    return null;
  });
  return { title: project ? `Edit ${project.project_name}` : "Edit project" };
}

export default async function EditProjectPage({
  params,
}: PageProps<"/projects/[id]/edit">) {
  const { id } = await params;

  let project;
  try {
    project = await getProject(id);
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <SetupNotice
          detail={error instanceof Error ? error.message : String(error)}
        />
      </div>
    );
  }
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Edit project"
        lead="Change the project's own details. Expenses, advances and bills are edited on their own screens."
        back={
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-1 text-[13px] text-steel transition-colors hover:text-steel-hover"
          >
            <Icon path={icons.chevronLeft} size={13} />
            Back to {project.project_name}
          </Link>
        }
      />

      <Card className="p-5 sm:p-6">
        <ProjectForm mode="edit" today={todayISO()} project={project} />
      </Card>
    </div>
  );
}
