"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search, X } from "lucide-react";

import {
  CATEGORY_LABELS,
  products,
  type Product,
  type ProductCategory,
} from "@/data/products";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionIntro } from "@/components/SectionIntro";

const CATEGORIES: ProductCategory[] = ["wash", "interior", "wax-polish", "accessories"];

type PriceRangeId = "all" | "under-25" | "25-50" | "over-50";

const PRICE_TESTS: Record<PriceRangeId, (p: number) => boolean> = {
  all: () => true,
  "under-25": (p) => p < 25,
  "25-50": (p) => p >= 25 && p <= 50,
  "over-50": (p) => p > 50,
};

const PRICE_OPTIONS: { id: PriceRangeId; label: string }[] = [
  { id: "all", label: "Any price" },
  { id: "under-25", label: "Under $25" },
  { id: "25-50", label: "$25 – $50" },
  { id: "over-50", label: "Over $50" },
];

type FilterChipProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

const FilterChip = ({ active, label, onClick }: FilterChipProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex items-center rounded-pill border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-line bg-card/60 text-foreground/70 hover:border-primary/40 hover:text-foreground"
    )}
  >
    {label}
  </button>
);

const ProductsSection = () => {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<ProductCategory>>(new Set());
  const [priceRange, setPriceRange] = useState<PriceRangeId>("all");

  const filtered = useMemo<Product[]>(() => {
    const query = search.trim().toLowerCase();
    const priceTest = PRICE_TESTS[priceRange];

    return products.filter((p) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(p.category)) return false;
      if (!priceTest(p.price)) return false;
      if (query) {
        const haystack = `${p.name} ${p.tagline} ${CATEGORY_LABELS[p.category]}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [search, selectedCategories, priceRange]);

  const toggleCategory = (cat: ProductCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const hasActiveFilters =
    search.length > 0 || selectedCategories.size > 0 || priceRange !== "all";

  const clearAll = () => {
    setSearch("");
    setSelectedCategories(new Set());
    setPriceRange("all");
  };

  return (
    <div className="flex h-full flex-col">
      <SectionIntro
        kicker="01 — Shop"
        title="Take the wash home with you."
        description="A small, hand-picked range of car care products we use in the bay every day. Online checkout is on the way — for now, drop in to grab a bottle."
        className="mb-10"
      />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="flex flex-col gap-7 rounded-[20px] border border-line bg-card-gradient p-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Filters
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3" />
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="product-search"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="product-search"
                type="search"
                placeholder="Wax, towel, shampoo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat}
                  active={selectedCategories.has(cat)}
                  label={CATEGORY_LABELS[cat]}
                  onClick={() => toggleCategory(cat)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Price
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_OPTIONS.map((range) => (
                <FilterChip
                  key={range.id}
                  active={priceRange === range.id}
                  label={range.label}
                  onClick={() => setPriceRange(range.id)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-line pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {filtered.length} of {products.length}{" "}
              {filtered.length === 1 ? "product" : "products"}
            </p>
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-[20px] border border-dashed border-line p-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                No matches
              </span>
              <h3 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                Nothing fits those filters.
              </h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Try a different category, widen the price range, or clear the search.
              </p>
              <Button variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, index) => {
                const isFeatured = product.badge === "Best seller";

                return (
                  <article
                    id={product.id}
                    key={product.id}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-[20px] border bg-card-gradient shadow-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-glow",
                      isFeatured ? "border-primary/40 hover:border-primary/60" : "border-line hover:border-line-2"
                    )}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                      <Image
                        src={product.image}
                        alt={`${product.name} — car care product`}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent",
                          isFeatured && "bg-gradient-to-t from-[#0A1F5C]/65 via-[#0A1F5C]/10 to-transparent"
                        )}
                      />

                      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/40 bg-white/85 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground backdrop-blur">
                          {CATEGORY_LABELS[product.category]}
                        </span>
                        {product.badge && (
                          <Badge
                            variant={isFeatured ? "default" : "outline"}
                            className={
                              isFeatured ? undefined : "border-white/60 bg-white/85 text-foreground"
                            }
                          >
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        0{index + 1} — Product
                      </span>

                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                          {product.name}
                        </h3>
                        <p className="text-[14px] leading-snug text-muted-foreground">
                          {product.tagline}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Price
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-[48px] leading-none text-primary">
                            ${product.price}
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            AUD · incl. GST
                          </span>
                        </div>
                      </div>

                      <ul className="flex flex-col gap-2 border-t border-dashed border-line pt-4 text-[14px] text-foreground/85">
                        {product.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <Button
                          variant="outline"
                          disabled
                          aria-disabled="true"
                          title="Online checkout coming soon"
                          className="cursor-not-allowed opacity-70"
                        >
                          Coming soon
                        </Button>
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          In-store now
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
