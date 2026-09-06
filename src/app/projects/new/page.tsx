import type { Metadata } from "next";
import Link from "next/link";

import { todayISO } from "@/lib/format";
import { NewProjectForm } from "@/components/NewProjectForm";
import { Card, Icon, icons, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="New project"
        lead="Every expense, advance and bill you record afterwards stays tied to this project alone."
        back={
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            <Icon path={icons.chevronLeft} size={13} />
            Projects
          </Link>
        }
      />

      <Card className="p-5 sm:p-6">
        <NewProjectForm today={todayISO()} />
      </Card>
    </div>
  );
}
