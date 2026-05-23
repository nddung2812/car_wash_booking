import Stripe from "stripe";
import { sql } from "drizzle-orm";

import { db, users } from "@/db";

type ClerkLike = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  emailAddresses: { id: string; emailAddress: string }[];
  primaryEmailAddressId?: string | null;
};

/**
 * Returns a Stripe Customer ID for the signed-in Clerk user, creating one on
 * first use. The mapping is persisted on `users.stripeCustomerId` so the same
 * customer is reused across orders — this is what makes Stripe Checkout
 * pre-fill name / email / phone / saved shipping addresses.
 */
export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  clerkUser: ClerkLike
): Promise<string | null> {
  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;
  if (!email) return null;

  const existing = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(sql`${users.id} = ${clerkUser.id}`)
    .limit(1);

  const stored = existing[0]?.stripeCustomerId;
  if (stored) {
    // Best-effort: verify it still exists. If Stripe deleted/test-reset it,
    // fall through and create a fresh one.
    try {
      const customer = await stripe.customers.retrieve(stored);
      if (customer && !("deleted" in customer && customer.deleted)) {
        return stored;
      }
    } catch {
      // ignored — recreate below
    }
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    clerkUser.fullName?.trim() ||
    undefined;

  const customer = await stripe.customers.create({
    email,
    name: fullName,
    metadata: { clerk_user_id: clerkUser.id },
  });

  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(sql`${users.id} = ${clerkUser.id}`);

  return customer.id;
}
