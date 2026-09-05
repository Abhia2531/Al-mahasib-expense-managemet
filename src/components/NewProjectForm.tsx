"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createProjectAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { SubmitButton } from "@/components/SubmitButton";
import { btn, ErrorNote, Field, input } from "@/components/ui";

export function NewProjectForm({ today }: { today: string }) {
  const [state, formAction] = useActionState(createProjectAction, idleState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <ErrorNote>{state.error}</ErrorNote> : null}

      <Field htmlFor="project_name" label="Project name">
        <input
          id="project_name"
          name="project_name"
          required
          autoFocus
          maxLength={120}
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
            placeholder="e.g. ABC Developers (Pvt) Ltd"
            className={input}
          />
        </Field>

        <Field htmlFor="location" label="Project location">
          <input
            id="location"
            name="location"
            maxLength={120}
            placeholder="e.g. Bahria Town, Lahore"
            className={input}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field htmlFor="start_date" label="Start date">
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={today}
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
            placeholder="0"
            className={`${input} tnum`}
          />
        </Field>

        <Field
          htmlFor="advance_amount"
          label="Advance received"
          hint="Saved as the first advance payment."
        >
          <input
            id="advance_amount"
            name="advance_amount"
            inputMode="decimal"
            placeholder="0"
            className={`${input} tnum`}
          />
        </Field>
      </div>

      <Field htmlFor="description" label="Project description">
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Scope of work, key notes, anything worth remembering."
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent outline-none resize-y"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <SubmitButton pendingLabel="Creating…">Create project</SubmitButton>
        <Link href="/" className={`${btn.base} ${btn.secondary}`}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
