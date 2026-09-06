import Link from "next/link";

import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { getUser } from "@/lib/auth";

/** App header. The Projects link and user menu only show once signed in. */
export async function AppHeader() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {user ? (
          <nav aria-label="Main" className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              Projects
            </Link>
            <UserMenu />
          </nav>
        ) : null}
      </div>
    </header>
  );
}
