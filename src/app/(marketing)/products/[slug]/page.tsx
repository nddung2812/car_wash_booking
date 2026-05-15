import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Truck } from "lucide-react";

import { products, CATEGORY_LABELS } from "@/data/products";
import {
  AUD,
  getProductBySlug,
  getRelatedProducts,
  gstComponent,
} from "@/lib/products";
import { SITE_URL, BUSINESS_NAME } from "@/lib/seo/business";
import { SHIPPING_FEE } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";
import JsonLd from "@/components/seo/JsonLd";
import CTABand from "@/components/CTABand";
import { ProductBuyBox } from "@/components/cart/ProductBuyBox";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false } };
  }

  const title = `${product.name} | Car Care Products`;
  const description = product.tagline;
  const url = `/products/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: `${product.name} | ${BUSINESS_NAME}`,
      description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const related = getRelatedProducts(product);
  const gst = gstComponent(product.price);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku ?? product.id,
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    category: CATEGORY_LABELS[product.category],
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: "AUD",
      price: product.price.toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: BUSINESS_NAME },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/products` },
      {
        "@type": "ListItem",
        position: 2,
        name: product.name,
        item: `${SITE_URL}/products/${product.id}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productLd} id="product-ld" />
      <JsonLd data={breadcrumbLd} id="product-breadcrumb-ld" />

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            <Link href="/products" className="transition-colors hover:text-foreground">
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">
              {CATEGORY_LABELS[product.category]}
            </span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-line bg-secondary">
                <Image
                  src={product.image}
                  alt={`${product.name} — car care product`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-pill border border-white/50 bg-white/85 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground backdrop-blur">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  {product.badge && (
                    <Badge
                      variant={
                        product.badge === "Best seller" ? "default" : "outline"
                      }
                      className={
                        product.badge === "Best seller"
                          ? undefined
                          : "border-white/60 bg-white/85 text-foreground"
                      }
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-3">
                {product.brand && (
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {product.brand}
                  </span>
                )}
                <h1 className="font-serif text-[32px] leading-[1.08] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
                  {product.name}
                </h1>
                <p className="text-[16px] leading-relaxed text-muted-foreground">
                  {product.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-x-3 gap-y-1 border-y border-dashed border-line py-5">
                <span className="font-serif text-[44px] leading-none text-primary tabular-nums sm:text-[52px]">
                  {AUD.format(product.price)}
                </span>
                <span className="pb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  AUD · incl. {AUD.format(gst)} GST
                </span>
              </div>

              <ProductBuyBox productId={product.id} inStock={product.inStock} />

              <div className="flex flex-col gap-2.5 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Secure card checkout — your payment is encrypted
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="size-4 text-primary" />
                  Flat {AUD.format(SHIPPING_FEE)} shipping · Australia-wide, 3–7
                  business days
                </span>
              </div>

              {product.features.length > 0 && (
                <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-card-gradient p-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    What you get
                  </span>
                  <ul className="flex flex-col gap-2.5 text-[14px] text-foreground/85">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Description
                </span>
                <p className="text-[15px] leading-relaxed text-foreground/85">
                  {product.description}
                </p>
                {product.sku && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    SKU · {product.sku}
                  </p>
                )}
              </div>

              <Link
                href="/products"
                className="inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to all products
              </Link>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-line pt-12">
              <div className="mb-8 flex items-end justify-between gap-4">
                <h2 className="font-serif text-[32px] leading-tight tracking-tight text-foreground">
                  You might also like
                </h2>
                <Link
                  href="/products"
                  className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  All products
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="group flex flex-col overflow-hidden rounded-[18px] border border-line bg-card-gradient transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-2"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                      <Image
                        src={rel.image}
                        alt={rel.name}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-serif text-[20px] leading-tight tracking-tight text-foreground">
                        {rel.name}
                      </h3>
                      <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                        {rel.tagline}
                      </p>
                      <span className="mt-auto pt-2 font-serif text-[24px] leading-none text-primary tabular-nums">
                        {AUD.format(rel.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTABand />
    </>
  );
}
