import { redirect } from "next/navigation";

// Combined into /account — keep this route working for older bookmarks
// and existing post-sign-in redirects until they're updated.
export default function MyBookingsPage() {
  redirect("/account");
}
