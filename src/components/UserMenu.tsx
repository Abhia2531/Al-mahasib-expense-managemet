import { getUser } from "@/lib/auth";

/** Header: who is signed in + a sign-out button. Renders nothing if signed out. */
export async function UserMenu() {
  const user = await getUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span
        className="hidden max-w-[12rem] truncate text-sm text-muted sm:inline"
        title={user.email ?? undefined}
      >
        {user.email}
      </span>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
