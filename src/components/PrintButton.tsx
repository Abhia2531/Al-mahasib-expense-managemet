"use client";

import { btn, Icon, icons } from "@/components/ui";

/** Triggers the browser's Print / Save as PDF dialog for the report sheet. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${btn.base} ${btn.primary}`}
    >
      <Icon path={icons.printer} size={16} />
      Print / Save as PDF
    </button>
  );
}
