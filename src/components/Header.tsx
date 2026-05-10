"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, MapPin, User, ArrowRight, LogOut } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton, useClerk } from "@clerk/nextjs";
import { ChromeBrand } from "@/components/visuals/ChromeBrand";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.refresh();
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Shop", href: "/products" },
    { name: "Booking", href: "/bookings" },
    { name: "Contact", href: "/contact" },
  ];

  const locations = [
    { name: "Shailer Park", href: "/locations/shailer-park" },
    { name: "Loganholme", href: "/locations/loganholme" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_10px_30px_-24px_rgba(0,0,0,0.25)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6 lg:h-[68px]">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5">
            <ChromeBrand size={36} />
            <span className="font-sans text-[22px] leading-none tracking-tight">Hyperdome</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navigation.map((item) =>
              item.href.startsWith("#") ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-mono text-[12px] uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-mono text-[12px] uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right cluster — locations + sign-in + book at md+ */}
          <div className="hidden items-center gap-2 md:flex lg:gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              {locations.map((location) => (
                <Link
                  key={location.name}
                  href={location.href}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <MapPin className="size-3.5" />
                  {location.name}
                </Link>
              ))}
            </div>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  <User className="size-4" />
                  <span>Sign in</span>
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/account/bookings"
                className="font-mono text-[12px] uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground"
              >
                My bookings
              </Link>
              <UserButton />
            </Show>
            <Button asChild size="sm">
              <Link href="/bookings">
                Book a wash
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                aria-describedby={undefined}
                className="w-[300px] sm:w-[380px] px-6 pt-6 pb-8"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-7">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <ChromeBrand size={40} />
                    <span className="font-sans text-2xl tracking-tight">Hyperdome</span>
                  </Link>

                  <nav className="flex flex-col gap-0.5">
                    {navigation.map((item) =>
                      item.href.startsWith("#") ? (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="rounded-xl px-3 py-1.5 font-sans text-lg tracking-tight text-foreground transition-colors hover:bg-secondary"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="rounded-xl px-3 py-1.5 font-sans text-lg tracking-tight text-foreground transition-colors hover:bg-secondary"
                        >
                          {item.name}
                        </Link>
                      )
                    )}
                  </nav>

                  <div className="flex flex-col gap-2 border-t border-line pt-5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Reach us
                    </span>
                    {locations.map((location) => (
                      <Link
                        key={location.name}
                        href={location.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl border border-line px-4 py-3 hover:text-primary transition-colors"
                      >
                        <MapPin className="size-4 text-muted-foreground" />
                        <span className="text-[15px] text-foreground">{location.name}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <Show when="signed-out">
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full justify-center">
                          <User className="size-4" />
                          Sign in
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button variant="ghost" className="w-full justify-center">
                          Create account
                        </Button>
                      </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                      <Button asChild variant="outline" className="w-full justify-center">
                        <Link
                          href="/account/bookings"
                          onClick={() => setIsOpen(false)}
                        >
                          My bookings
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-center"
                        onClick={handleSignOut}
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </Button>
                    </Show>
                    <Button asChild size="lg" className="w-full justify-center">
                      <Link href="/bookings" onClick={() => setIsOpen(false)}>
                        Book a wash
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
