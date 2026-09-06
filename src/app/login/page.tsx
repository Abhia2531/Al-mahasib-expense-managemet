import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/LoginForm";
import { Card } from "@/components/ui";
import { isPublicEnvConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/SetupNotice";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-sm flex-col justify-center px-4 py-12">
      {isPublicEnvConfigured() ? (
        <Card className="p-6">
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Sign in
          </h1>
          <p className="mt-1 mb-5 text-sm text-muted">
            Use the account created for you in Supabase.
          </p>
          <Suspense fallback={<div className="h-56" />}>
            <LoginForm />
          </Suspense>
        </Card>
      ) : (
        <SetupNotice detail="Supabase environment variables are not set." />
      )}

      <p className="mt-6 text-center text-xs text-muted">
        No self-service sign-up. Ask an administrator to add your account in the
        Supabase dashboard.
      </p>
    </div>
  );
}
