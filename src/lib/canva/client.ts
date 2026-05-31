import { getValidAccessToken } from "./tokens";

/**
 * Thin wrappers over the Canva Connect REST API for the banner feature.
 *
 * Note on "make a banner from a prompt": the Connect API does not expose
 * text-to-design AI generation. The robust, production path is **brand-template
 * autofill** — the business creates a branded banner template in Canva with
 * named data fields (e.g. `headline`, `subheadline`, `price`, `cta`) and the
 * agent fills them. A blank custom-size design is supported as a fallback.
 *
 * Both create (autofill) and export are asynchronous JOBS — submit, then poll
 * until `success`/`failed`.
 */

const API_BASE = "https://api.canva.com/rest/v1";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 50_000;

async function canvaFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getValidAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canva ${init?.method ?? "GET"} ${path} → ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

async function poll<T>(
  fetchJob: () => Promise<T>,
  isDone: (job: T) => boolean,
  isFailed: (job: T) => boolean,
): Promise<T> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  // First check is immediate; small jobs are often already done.
  for (;;) {
    const job = await fetchJob();
    if (isDone(job)) return job;
    if (isFailed(job)) {
      throw new Error("Canva job failed");
    }
    if (Date.now() > deadline) {
      throw new Error("Canva job timed out before completing");
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// ---- Autofill (brand template → finished design) --------------------------

export type AutofillField =
  | { type: "text"; text: string }
  | { type: "image"; asset_id: string };

type AutofillJob = {
  job: {
    id: string;
    status: "in_progress" | "success" | "failed";
    result?: { type: "create_design"; design: { id: string; url?: string } };
    error?: { code: string; message: string };
  };
};

/**
 * Autofill a Canva brand template and wait for the finished design.
 * Returns the new design id. `data` keys must match the template's data fields.
 */
export async function autofillAndWait(params: {
  brandTemplateId: string;
  data: Record<string, AutofillField>;
  title?: string;
}): Promise<{ designId: string }> {
  const created = await canvaFetch<AutofillJob>("/autofills", {
    method: "POST",
    body: JSON.stringify({
      brand_template_id: params.brandTemplateId,
      title: params.title,
      data: params.data,
    }),
  });

  const done = await poll(
    () => canvaFetch<AutofillJob>(`/autofills/${created.job.id}`),
    (j) => j.job.status === "success",
    (j) => j.job.status === "failed",
  );
  const designId = done.job.result?.design.id;
  if (!designId) throw new Error("Canva autofill returned no design id");
  return { designId };
}

// ---- Blank design (fallback) ----------------------------------------------

type CreateDesignResponse = { design: { id: string; urls?: { edit_url?: string } } };

/** Create a blank custom-size design. Used as a fallback when no template. */
export async function createDesign(params: {
  width: number;
  height: number;
  title?: string;
}): Promise<{ designId: string }> {
  const res = await canvaFetch<CreateDesignResponse>("/designs", {
    method: "POST",
    body: JSON.stringify({
      design_type: {
        type: "custom",
        width: params.width,
        height: params.height,
      },
      title: params.title,
    }),
  });
  return { designId: res.design.id };
}

// ---- Export (design → downloadable image URL) -----------------------------

type ExportJob = {
  job: {
    id: string;
    status: "in_progress" | "success" | "failed";
    urls?: string[];
    error?: { code: string; message: string };
  };
};

/**
 * Export a design to PNG and wait for the asset URL. The returned Canva URL is
 * temporary (~24h) — mirror it into permanent storage immediately.
 */
export async function exportAndWait(params: {
  designId: string;
}): Promise<{ url: string }> {
  const created = await canvaFetch<ExportJob>("/exports", {
    method: "POST",
    body: JSON.stringify({
      design_id: params.designId,
      format: { type: "png" },
    }),
  });

  const done = await poll(
    () => canvaFetch<ExportJob>(`/exports/${created.job.id}`),
    (j) => j.job.status === "success",
    (j) => j.job.status === "failed",
  );
  const url = done.job.urls?.[0];
  if (!url) throw new Error("Canva export returned no URL");
  return { url };
}