import { currentUser, type User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/**
 * Redirect to sign-in if not logged in, or to `/` if the signed-in user's
 * email isn't on the admin allowlist. Returns the Clerk user for server pages.
 */
export async function requireAdmin(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const email = user.primaryEmailAddress?.emailAddress;
  if (!isAdminEmail(email)) redirect("/");
  return user;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  return isAdminEmail(user.primaryEmailAddress?.emailAddress);
}
