import { tool } from "ai";
import { z } from "zod";
import { autofillAndWait, createDesign, exportAndWait } from "./client";
import { uploadRemoteImage, BANNERS_FOLDER } from "@/lib/cloudinary-admin";
import {
  insertBanner,
  updateBanner,
  getBannerRow,
  DEFAULT_SLOT,
} from "@/lib/banners";

const BRAND_TEMPLATE_ID = process.env.CANVA_BRAND_TEMPLATE_ID ?? "";

/** Default banner canvas when falling back to a blank design (≈ web hero). */
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 628;

/**
 * Build the Canva banner tools for one chat session. `createdBy` (the admin's
 * email) is captured here rather than taken from the model, so it can't be
 * spoofed by tool input.
 *
 * Flow the model is expected to follow:
 *   1. create_banner_design  → makes the design in Canva, returns a bannerId
 *   2. export_banner         → renders it, stores it in Cloudinary + DB (ready)
 * The admin then clicks "Set live" in the UI to publish it.
 */
export function buildBannerTools(opts: { createdBy: string }) {
  const create_banner_design = tool({
    description:
      "Create a marketing banner design in Canva from the copy you've agreed " +
      "with the admin. Returns a bannerId. You MUST call export_banner next to " +
      "render and store it. Uses the configured brand template when available.",
    inputSchema: z.object({
      summary: z
        .string()
        .describe("Short description of the banner, stored as the prompt."),
      headline: z.string().describe("Main headline text."),
      subheadline: z.string().optional().describe("Optional supporting line."),
      price: z.string().optional().describe("Optional price/offer, e.g. '$99'."),
      cta: z.string().optional().describe("Optional call-to-action, e.g. 'Book now'."),
      altText: z
        .string()
        .describe("Accessibility alt text describing the banner image."),
      href: z
        .string()
        .optional()
        .describe("Where the banner links when clicked. Default '#booking'."),
    }),
    execute: async (input) => {
      let designId: string;
      let mode: "template" | "blank";

      if (BRAND_TEMPLATE_ID) {
        const data: Record<string, { type: "text"; text: string }> = {
          headline: { type: "text", text: input.headline },
        };
        if (input.subheadline)
          data.subheadline = { type: "text", text: input.subheadline };
        if (input.price) data.price = { type: "text", text: input.price };
        if (input.cta) data.cta = { type: "text", text: input.cta };
        const res = await autofillAndWait({
          brandTemplateId: BRAND_TEMPLATE_ID,
          data,
          title: input.headline,
        });
        designId = res.designId;
        mode = "template";
      } else {
        const res = await createDesign({
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          title: input.headline,
        });
        designId = res.designId;
        mode = "blank";
      }

      const banner = await insertBanner({
        prompt: input.summary,
        canvaDesignId: designId,
        altText: input.altText,
        href: input.href || "#booking",
        status: "generating",
        slot: DEFAULT_SLOT,
        createdBy: opts.createdBy,
      });

      return {
        bannerId: banner.id,
        designId,
        mode,
        note:
          mode === "blank"
            ? "No brand template configured (CANVA_BRAND_TEMPLATE_ID). Created a " +
              "blank design — it will export as an empty canvas until the template " +
              "is set up. Call export_banner to continue."
            : "Design created from the brand template. Call export_banner next.",
      };
    },
  });

  const export_banner = tool({
    description:
      "Render the previously created banner to an image, store it permanently " +
      "in Cloudinary, and mark it ready. Call after create_banner_design.",
    inputSchema: z.object({
      bannerId: z
        .string()
        .describe("The bannerId returned by create_banner_design."),
    }),
    execute: async (input) => {
      const banner = await getBannerRow(input.bannerId);
      if (!banner) throw new Error(`Unknown bannerId: ${input.bannerId}`);
      if (!banner.canvaDesignId)
        throw new Error("Banner has no Canva design to export.");

      try {
        const { url } = await exportAndWait({ designId: banner.canvaDesignId });
        const stored = await uploadRemoteImage({
          url,
          folder: BANNERS_FOLDER,
          publicId: `banner-${banner.id}`,
        });
        const ready = await updateBanner(banner.id, {
          status: "ready",
          cloudinaryUrl: stored.url,
          cloudinaryPublicId: stored.publicId,
          width: stored.width,
          height: stored.height,
        });
        return {
          bannerId: banner.id,
          status: "ready" as const,
          imageUrl: ready?.cloudinaryUrl,
          width: ready?.width,
          height: ready?.height,
          altText: ready?.altText,
        };
      } catch (err) {
        await updateBanner(banner.id, { status: "failed" });
        throw err instanceof Error ? err : new Error("Export failed");
      }
    },
  });

  return { create_banner_design, export_banner };
}