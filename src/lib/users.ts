import { sql } from "drizzle-orm";

import { db, users } from "@/db";

/**
 * Ensures a `users` row exists keyed by `clerkUserId` before another table
 * FK-links to it. Handles three cases:
 *   1. Row with this id already exists → noop.
 *   2. No row at all → insert it.
 *   3. Row with the same email but a DIFFERENT id (e.g. Clerk user recreated
 *      against an existing email, or stale dev data) → re-key the existing
 *      row to the new Clerk id so historical bookings/orders stay attached.
 *
 * Returns `true` if the FK will be satisfiable after this call.
 */
export async function ensureUserRow(args: {
  clerkUserId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}): Promise<boolean> {
  const { clerkUserId, email, firstName, lastName, imageUrl } = args;

  try {
    // Case 1: already linked.
    const byId = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.id} = ${clerkUserId}`)
      .limit(1);
    if (byId.length > 0) return true;

    if (!email) return false;

    // Case 3: same email under a stale id — re-key it.
    const byEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = lower(${email})`)
      .limit(1);
    if (byEmail.length > 0 && byEmail[0].id !== clerkUserId) {
      await db
        .update(users)
        .set({ id: clerkUserId })
        .where(sql`${users.id} = ${byEmail[0].id}`);
      return true;
    }

    // Case 2: insert fresh.
    await db
      .insert(users)
      .values({
        id: clerkUserId,
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        imageUrl: imageUrl ?? null,
      })
      .onConflictDoNothing();
    return true;
  } catch (err) {
    console.error("[users] ensureUserRow failed", err);
    return false;
  }
}
