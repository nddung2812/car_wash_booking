"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { AUD } from "@/lib/products";
import { SHIPPING_FEE } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/SectionIntro";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";

function CheckoutContent() {
  const { lines, totals, hydrated, setQty, removeItem } = useCart();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmpty = lines.length === 0;
  const grandTotal = Math.round((totals.total + SHIPPING_FEE) * 100) / 100;

  async function handlePay() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <section className="py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Continue shopping
        </Link>

        <SectionIntro
          kicker="02 — Checkout"
          title="Review your order."
          description="Confirm your items below, then pay securely by card. We'll ship Australia-wide and you'll add your delivery address at checkout."
          className="mb-10"
        />

        {canceled && (
          <div className="mb-8 rounded-[16px] border border-line bg-yellow-soft/40 px-5 py-4 text-[14px] text-yellow-ink">
            Checkout was canceled — no payment was taken and your cart is saved.
          </div>
        )}

        {!hydrated ? (
          <div className="rounded-[20px] border border-dashed border-line p-12 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
            Loading your cart…
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-5 rounded-[20px] border border-dashed border-line p-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-pill border border-dashed border-line text-muted-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                Your cart is empty
              </h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Add a product before heading to checkout.
              </p>
            </div>
            <Button asChild>
              <Link href="/products">Shop products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-line rounded-[20px] border border-line bg-card-gradient px-4 sm:px-6">
              {lines.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
                  <Link
                    href={`/products/${product.id}`}
                    className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-[14px] border border-line bg-secondary sm:w-24"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 640px) 96px, 80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-[16px] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        {product.brand && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {product.brand}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <QuantityStepper
                        size="sm"
                        value={qty}
                        onChange={(next) => setQty(product.id, next)}
                      />
                      <span className="font-serif text-[22px] leading-none text-foreground tabular-nums">
                        {AUD.format(lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="flex flex-col gap-5 rounded-[20px] border border-line bg-card-gradient p-6 lg:sticky lg:top-24 lg:self-start">
              <h2 className="font-serif text-[24px] leading-tight tracking-tight text-foreground">
                Order summary
              </h2>

              <div className="flex flex-col gap-2.5 border-y border-dashed border-line py-4 text-[14px]">
                <div className="flex items-center justify-between text-foreground">
                  <span>
                    Subtotal · {totals.count}{" "}
                    {totals.count === 1 ? "item" : "items"}
                  </span>
                  <span className="tabular-nums">
                    {AUD.format(totals.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>GST included</span>
                  <span className="tabular-nums">
                    {AUD.format(totals.gstIncluded)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping (flat rate)</span>
                  <span className="tabular-nums">{AUD.format(SHIPPING_FEE)}</span>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Total
                </span>
                <span className="font-serif text-[36px] leading-none text-primary tabular-nums">
                  {AUD.format(grandTotal)}
                </span>
              </div>

              <p className="-mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Shipped Australia-wide. Add your delivery address on the next
                step (secured by Stripe).
              </p>

              {error && (
                <p
                  role="alert"
                  className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
                >
                  {error}
                </p>
              )}

              <Button
                size="lg"
                className="w-full justify-center"
                disabled={submitting}
                onClick={handlePay}
              >
                {submitting ? (
                  "Redirecting to secure checkout…"
                ) : (
                  <>
                    <Lock className="size-4" />
                    Pay {AUD.format(grandTotal)}
                  </>
                )}
              </Button>

              <p className="flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                Secured by Stripe · cards encrypted
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[20px] border border-dashed border-line p-12 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
              Loading checkout…
            </div>
          </div>
        </section>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
