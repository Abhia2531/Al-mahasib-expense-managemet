import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { getUser } from "@/lib/auth";

/** App header. The user menu only shows once signed in. */
export async function AppHeader() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        {user ? <UserMenu /> : null}
      </div>
    </header>
  );
}
