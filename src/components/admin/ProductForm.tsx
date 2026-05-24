"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/db";

export type ProductFormValues = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: "wash" | "interior" | "wax-polish" | "accessories";
  features: string[];
  images: ProductImage[];
  badge?: "Best seller" | "New" | "Staff pick" | null;
  brand?: string | null;
  sku?: string | null;
  sourceUrl?: string | null;
  inStock: boolean;
  sortOrder: number;
};

const CATEGORIES = ["wash", "interior", "wax-polish", "accessories"] as const;
const BADGES = ["", "Best seller", "New", "Staff pick"] as const;

type Props = {
  mode: "create" | "edit";
  initial: ProductFormValues;
};

type SignatureResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId?: string;
  signature: string;
};

async function uploadToCloudinary(file: File): Promise<ProductImage> {
  const sigRes = await fetch("/api/admin/cloudinary/signature", {
    method: "POST",
  });
  if (!sigRes.ok) {
    const body = await sigRes.json().catch(() => ({}));
    throw new Error(body.error ?? "Could not get upload signature");
  }
  const sig = (await sigRes.json()) as SignatureResponse;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("folder", sig.folder);
  fd.append("signature", sig.signature);

  const upRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: fd },
  );
  if (!upRes.ok) {
    const text = await upRes.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }
  const j = (await upRes.json()) as { secure_url: string; public_id: string };
  return { url: j.secure_url, publicId: j.public_id };
}

export function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormValues>(
    key: K,
    val: ProductFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const img = await uploadToCloudinary(file);
      setValues((v) => ({ ...v, images: [...v.images, img] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleImageDelete(index: number) {
    const img = values.images[index];
    if (!img) return;
    if (!confirm("Remove this image? It will also be deleted from Cloudinary.")) {
      return;
    }
    if (img.publicId) {
      try {
        await fetch("/api/admin/cloudinary/destroy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: img.publicId }),
        });
      } catch {
        /* ignore — we still drop the reference locally */
      }
    }
    setValues((v) => ({
      ...v,
      images: v.images.filter((_, i) => i !== index),
    }));
  }

  function moveImage(from: number, to: number) {
    setValues((v) => {
      if (to < 0 || to >= v.images.length) return v;
      const next = [...v.images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...v, images: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      ...values,
      features: featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      badge: values.badge || null,
      brand: values.brand || null,
      sku: values.sku || null,
      sourceUrl: values.sourceUrl || null,
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const details = body.details?.fieldErrors as
          | Record<string, string[]>
          | undefined;
        const fieldMsg = details
          ? Object.entries(details)
              .map(([k, v]) => `${k}: ${v.join(", ")}`)
              .join(" · ")
          : null;
        throw new Error(fieldMsg ?? body.error ?? "Save failed");
      }
      router.push("/hyperdome-dashboard/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-line bg-card px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none";
  const labelCls =
    "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Slug (URL ID)</label>
          <input
            className={inputCls}
            value={values.id}
            onChange={(e) =>
              set(
                "id",
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, ""),
              )
            }
            disabled={mode === "edit"}
            required
            minLength={2}
            title="lowercase letters, numbers and hyphens only"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Category</label>
          <select
            className={inputCls}
            value={values.category}
            onChange={(e) =>
              set("category", e.target.value as ProductFormValues["category"])
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Name</label>
        <input
          className={inputCls}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Tagline</label>
        <input
          className={inputCls}
          value={values.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Description</label>
        <textarea
          className={inputCls}
          rows={5}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Price (AUD, incl. GST)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Sort order</label>
          <input
            type="number"
            className={inputCls}
            value={values.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Badge</label>
          <select
            className={inputCls}
            value={values.badge ?? ""}
            onChange={(e) =>
              set(
                "badge",
                (e.target.value === ""
                  ? null
                  : (e.target.value as ProductFormValues["badge"])) ?? null,
              )
            }
          >
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {b || "— none —"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Brand</label>
          <input
            className={inputCls}
            value={values.brand ?? ""}
            onChange={(e) => set("brand", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>SKU</label>
          <input
            className={inputCls}
            value={values.sku ?? ""}
            onChange={(e) => set("sku", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Source URL</label>
          <input
            type="url"
            className={inputCls}
            value={values.sourceUrl ?? ""}
            onChange={(e) => set("sourceUrl", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="inStock"
          type="checkbox"
          checked={values.inStock}
          onChange={(e) => set("inStock", e.target.checked)}
        />
        <label htmlFor="inStock" className="text-[13px] text-foreground">
          In stock
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Features (one per line)</label>
        <textarea
          className={inputCls}
          rows={4}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Images</label>
          <label className="cursor-pointer rounded-md border border-line bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground hover:bg-secondary">
            {uploading ? "Uploading…" : "+ Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
        {values.images.length === 0 ? (
          <p className="rounded-md border border-dashed border-line px-3 py-6 text-center text-[12px] text-muted-foreground">
            No images yet. The first image becomes the product&apos;s primary image.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {values.images.map((img, i) => (
              <li
                key={`${img.url}-${i}`}
                className="flex flex-col gap-2 rounded-md border border-line bg-card p-2"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-secondary">
                  <Image
                    src={img.url}
                    alt={`Image ${i + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-pill bg-primary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-primary-foreground">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      disabled={i === 0}
                      className="rounded border border-line px-1.5 py-0.5 hover:bg-secondary disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      disabled={i === values.images.length - 1}
                      className="rounded border border-line px-1.5 py-0.5 hover:bg-secondary disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImageDelete(i)}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-5 py-2 font-mono text-[12px] uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/hyperdome-dashboard/products")}
          className="text-[12px] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
