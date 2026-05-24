import Link from "next/link";
import { listProductRows } from "@/lib/products";
import { AUD } from "@/lib/products";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await listProductRows();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {rows.length} {rows.length === 1 ? "product" : "products"} in catalogue
          </p>
        </div>
        <Link
          href="/hyperdome-dashboard/products/new"
          className="rounded-md bg-primary px-4 py-2 font-mono text-[12px] uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90"
        >
          + New product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line bg-secondary/30 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No products yet. Click &ldquo;New product&rdquo; to add one, or run
                  <code className="mx-1 rounded bg-secondary px-1 py-0.5 font-mono text-[12px]">
                    npm run db:seed:products
                  </code>
                  to import the static catalogue.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                    {p.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {AUD.format(Number(p.price))}
                  </td>
                  <td className="px-4 py-3">
                    {p.inStock ? (
                      <span className="rounded-pill bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-900">
                        In stock
                      </span>
                    ) : (
                      <span className="rounded-pill bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                        Sold out
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                    {p.images?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/hyperdome-dashboard/products/${p.id}`}
                        className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <ProductDeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
