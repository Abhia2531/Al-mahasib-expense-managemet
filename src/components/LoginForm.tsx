"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { btn, ErrorNote, Field, input } from "@/components/ui";

/** Only a safe same-origin path is honoured as the post-login destination. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const supabase = getBrowserSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <Field htmlFor="email" label="Email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
      </Field>

      <Field htmlFor="password" label="Password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className={`${btn.base} ${btn.primary} ${btn.lg} w-full`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
