import { getUser } from "@/lib/auth";

/** Header: signed-in email + sign-out. Renders nothing when signed out. */
export async function UserMenu() {
  const user = await getUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[13rem] truncate text-[12.5px] text-muted md:inline"
        title={user.email ?? undefined}
        translate="no"
      >
        {user.email}
      </span>
      <span aria-hidden="true" className="hidden h-3.5 w-px bg-border md:block" />
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-md px-2 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
