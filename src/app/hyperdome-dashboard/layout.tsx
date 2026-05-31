import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hyperdome Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const NAV = [
  { href: "/hyperdome-dashboard", label: "Analytics" },
  { href: "/hyperdome-dashboard/products", label: "Products" },
  { href: "/hyperdome-dashboard/prices", label: "Prices" },
  { href: "/hyperdome-dashboard/banners", label: "Banners" },
];

export default async function HyperdomeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const email = user.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-card">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/hyperdome-dashboard"
              className="font-serif text-xl tracking-tight text-foreground"
            >
              Hyperdome Admin
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Internal · Noindex
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <span className="truncate">{email}</span>
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-[0.14em] hover:text-foreground"
            >
              Back to site
            </Link>
          </div>
        </div>
        <nav className="container mx-auto flex gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent px-3 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-line hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
