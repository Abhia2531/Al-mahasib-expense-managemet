import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/LoginForm";
import { isPublicEnvConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/SetupNotice";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-[22rem] flex-col justify-center px-4 py-12">
      <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
        Sign in
      </h1>
      <p className="mt-1 mb-6 text-[13px] text-muted">
        Use the account created for you in Supabase.
      </p>

      {isPublicEnvConfigured() ? (
        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>
      ) : (
        <SetupNotice detail="Supabase environment variables are not set." />
      )}

      <p className="mt-8 text-[12px] leading-relaxed text-faint">
        No self-service sign-up. Ask an administrator to add your account under
        Authentication → Users in the Supabase dashboard.
      </p>
    </div>
  );
}
