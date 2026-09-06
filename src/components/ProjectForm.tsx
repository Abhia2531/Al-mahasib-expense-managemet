"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createProjectAction, updateProjectAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { SubmitButton } from "@/components/SubmitButton";
import { btn, ErrorNote, Field, input, textarea } from "@/components/ui";
import type { Project } from "@/lib/types";

/**
 * Create and Edit share this form — same fields, same layout. Edit omits the
 * "advance received" field: that first advance is a transaction, recorded once
 * at creation and managed on the Advances screen afterwards.
 */
export function ProjectForm({
  mode,
  today,
  project,
}: {
  mode: "create" | "edit";
  today: string;
  project?: Project;
}) {
  const action = mode === "create" ? createProjectAction : updateProjectAction;
  const [state, formAction] = useActionState(action, idleState);
  const cancelHref = mode === "edit" && project ? `/projects/${project.id}` : "/";

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <ErrorNote>{state.error}</ErrorNote> : null}
      {mode === "edit" && project ? (
        <input type="hidden" name="id" value={project.id} />
      ) : null}

      <Field htmlFor="project_name" label="Project name">
        <input
          id="project_name"
          name="project_name"
          required
          autoFocus
          maxLength={120}
          autoComplete="off"
          spellCheck={false}
          defaultValue={project?.project_name ?? ""}
          placeholder="e.g. ABC Construction"
          className={input}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="client_name" label="Client name">
          <input
            id="client_name"
            name="client_name"
            maxLength={120}
            autoComplete="organization"
            defaultValue={project?.client_name ?? ""}
            placeholder="e.g. ABC Developers (Pvt) Ltd"
            className={input}
          />
        </Field>

        <Field htmlFor="location" label="Project location">
          <input
            id="location"
            name="location"
            maxLength={120}
            autoComplete="off"
            defaultValue={project?.location ?? ""}
            placeholder="e.g. Bahria Town, Lahore"
            className={input}
          />
        </Field>
      </div>

      <div
        className={`grid gap-5 ${
          mode === "create" ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        <Field htmlFor="start_date" label="Start date">
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={project?.start_date ?? (mode === "create" ? today : "")}
            className={input}
          />
        </Field>

        <Field
          htmlFor="contract_value"
          label="Contract / project value"
          hint="Rupees. Leave blank if not agreed yet."
        >
          <input
            id="contract_value"
            name="contract_value"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={
              project && project.contract_value > 0
                ? String(project.contract_value)
                : ""
            }
            placeholder="0"
            className={`${input} tnum`}
          />
        </Field>

        {mode === "create" ? (
          <Field
            htmlFor="advance_amount"
            label="Advance received"
            hint="Saved as the first advance payment."
          >
            <input
              id="advance_amount"
              name="advance_amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              className={`${input} tnum`}
            />
          </Field>
        ) : null}
      </div>

      <Field htmlFor="description" label="Project description">
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          defaultValue={project?.description ?? ""}
          placeholder="Scope of work, key notes, anything worth remembering."
          className={textarea}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <SubmitButton
          pendingLabel={mode === "create" ? "Creating…" : "Saving…"}
        >
          {mode === "create" ? "Create project" : "Save changes"}
        </SubmitButton>
        <Link href={cancelHref} className={`${btn.base} ${btn.ghost}`}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
