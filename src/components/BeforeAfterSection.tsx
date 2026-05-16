import { SectionIntro } from "@/components/SectionIntro";
import BeforeAfterCarousel from "@/components/BeforeAfterCarousel";
import { BEFORE_AFTER_FOLDER, getBeforeAfterPairs } from "@/lib/cloudinary";

const KICKER = "Before & after";
const TITLE = "The Full Detail difference.";
const DESCRIPTION =
  "Real cars, real results. Slide through the gallery to see what a full hand detail — inside, outside, bugs, hand polish and engine bay — actually delivers.";

export default async function BeforeAfterSection() {
  const pairs = await getBeforeAfterPairs();

  if (pairs.length === 0) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionIntro
            kicker={KICKER}
            title={TITLE}
            description={DESCRIPTION}
            className="mb-8"
          />
          <div className="rounded-[20px] border border-dashed border-line bg-card-gradient p-8 text-sm leading-relaxed text-muted-foreground">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
              Dev-only placeholder — hidden in production until images exist
            </p>
            <p className="mt-3">
              In the{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                {BEFORE_AFTER_FOLDER}
              </code>{" "}
              folder on Cloudinary, create one subfolder per slide (e.g.{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                {BEFORE_AFTER_FOLDER}/slide-1
              </code>
              ) and drop two photos inside — one whose name contains{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                before
              </code>{" "}
              and one containing{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                after
              </code>
              . New uploads appear within ~1 hour (no redeploy needed).
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker={KICKER}
          title={TITLE}
          description={DESCRIPTION}
          className="mb-10"
        />
        <BeforeAfterCarousel pairs={pairs} />
      </div>
    </section>
  );
}
