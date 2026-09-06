"use client";

import { useFormStatus } from "react-dom";

import { btn } from "@/components/ui";

/**
 * Submit button that disables itself while its form is in flight. Must be
 * rendered inside the <form> it belongs to — that is how useFormStatus finds it.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "lg";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${btn.base} ${btn[variant]} ${size ? btn[size] : ""} ${className}`}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
