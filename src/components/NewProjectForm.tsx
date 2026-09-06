"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createProjectAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { SubmitButton } from "@/components/SubmitButton";
import { btn, ErrorNote, Field, input, textarea } from "@/components/ui";

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
          autoComplete="off"
          spellCheck={false}
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
            placeholder="e.g. ABC Developers (Pvt) Ltd"
            className={input}
          />
        </Field>

        <Field htmlFor="location" label="Location">
          <input
            id="location"
            name="location"
            maxLength={120}
            autoComplete="off"
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
          label="Contract value"
          hint="Rupees. Leave blank if not agreed yet."
        >
          <input
            id="contract_value"
            name="contract_value"
            inputMode="decimal"
            autoComplete="off"
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
            autoComplete="off"
            placeholder="0"
            className={`${input} tnum`}
          />
        </Field>
      </div>

      <Field htmlFor="description" label="Description">
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Scope of work, key notes, anything worth remembering."
          className={textarea}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <SubmitButton pendingLabel="Creating…">Create project</SubmitButton>
        <Link href="/" className={`${btn.base} ${btn.ghost}`}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
