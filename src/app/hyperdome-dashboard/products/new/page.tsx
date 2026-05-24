import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hyperdome-dashboard/products"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        ← Back to products
      </Link>
      <h1 className="font-serif text-3xl tracking-tight text-foreground">
        New product
      </h1>
      <ProductForm
        mode="create"
        initial={{
          id: "",
          name: "",
          tagline: "",
          description: "",
          price: 0,
          category: "accessories",
          features: [],
          images: [],
          badge: null,
          brand: "",
          sku: "",
          sourceUrl: "",
          inStock: true,
          sortOrder: 0,
        }}
      />
    </div>
  );
}
