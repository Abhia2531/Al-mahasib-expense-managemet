"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { btn, input } from "@/components/ui";

/**
 * Opens the expense page for any date. A day's page exists as soon as you
 * navigate to it — there is nothing to "create" first, which keeps daily
 * entry down to picking a date and typing.
 */
export function OpenDayPicker({
  projectId,
  defaultDate,
}: {
  projectId: string;
  defaultDate: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(defaultDate);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (date) router.push(`/projects/${projectId}/expenses/${date}`);
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <div>
        <label
          htmlFor="open-day"
          className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted"
        >
          Open a date
        </label>
        <input
          id="open-day"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={`${input} w-44`}
        />
      </div>
      <button type="submit" className={`${btn.base} ${btn.secondary}`}>
        Open page
      </button>
    </form>
  );
}
