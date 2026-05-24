"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This also removes its Cloudinary images.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? "Delete failed");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Network error");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="font-mono text-[11px] uppercase tracking-[0.12em] text-destructive hover:underline disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
