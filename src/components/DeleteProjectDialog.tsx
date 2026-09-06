"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { deleteProjectAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { btn, ErrorNote, Icon, icons, input } from "@/components/ui";

/**
 * "Delete project" button + a modal confirmation. Deleting a project also
 * deletes every expense, advance and bill under it, so the modal spells that
 * out and makes the user type the project name — no single mis-click can do it.
 */
export function DeleteProjectDialog({
  projectId,
  projectName,
  summary,
  triggerClassName,
  triggerLabel = "Delete project",
}: {
  projectId: string;
  projectName: string;
  summary?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  function close() {
    setOpen(false);
    setConfirm("");
    setError(null);
  }

  const matches = confirm.trim().toLowerCase() === projectName.trim().toLowerCase();

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      const result = await deleteProjectAction(idleState, formData);
      // On success the action redirects; only failures return here.
      if (!result.ok) setError(result.error ?? "Could not delete this project.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? `${btn.base} ${btn.danger}`}
      >
        <Icon path={icons.trash} size={15} />
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={close}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface p-0 text-ink shadow-[var(--shadow-pop)] backdrop:bg-black/40 backdrop:backdrop-blur-[1px]"
      >
        <div className="p-4 xs:p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neg/30 bg-neg-soft text-neg"
            >
              <Icon path={icons.warning} size={17} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-ink">
                Delete this project?
              </h2>
              <p className="mt-1 text-sm text-ink-2">
                <span className="font-semibold text-ink">{projectName}</span> and{" "}
                {summary ??
                  "all of its expenses, advances and progress bills"}{" "}
                will be permanently deleted. This cannot be undone.
              </p>
            </div>
          </div>

          <form
            action={handleDelete}
            className="mt-5 space-y-3"
          >
            <input type="hidden" name="id" value={projectId} />
            <input type="hidden" name="project_name" value={projectName} />

            <label
              htmlFor="delete-confirm"
              className="block text-[13px] font-medium text-ink-2"
            >
              Type{" "}
              <span className="font-semibold text-ink" translate="no">
                {projectName}
              </span>{" "}
              to confirm
            </label>
            <input
              id="delete-confirm"
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={input}
            />

            {error ? <ErrorNote>{error}</ErrorNote> : null}

            <div className="flex flex-col-reverse gap-2 pt-1 xs:flex-row xs:justify-end">
              <button
                type="button"
                onClick={close}
                className={`${btn.base} ${btn.secondary} w-full justify-center xs:w-auto`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!matches || isPending}
                className={`${btn.base} ${btn.dangerSolid} w-full justify-center xs:w-auto`}
              >
                {isPending ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
