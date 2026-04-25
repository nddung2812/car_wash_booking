import { Calendar, Car, Droplet, Sparkles } from "lucide-react";

import { SectionIntro } from "@/components/SectionIntro";
import { IconPill } from "@/components/ui/icon-pill";

const steps = [
  { icon: Calendar, label: "Pick a service", body: "Choose a wash or detail in under a minute." },
  { icon: Car, label: "Tell us the car", body: "Vehicle size sets the right time and price." },
  { icon: Sparkles, label: "Drop in", body: "Drive in — we'll take it from there." },
  { icon: Droplet, label: "Drive out shining", body: "Hand-finished, inspected, ready to go." },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="03 — How it works"
          title="Four steps. One sparkling drive away."
          className="mb-12"
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.label}
                className="lift relative flex flex-col gap-4 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <IconPill>
                    <Icon className="size-4" />
                  </IconPill>
                </div>
                <h3 className="font-serif text-2xl leading-tight tracking-tight text-foreground">
                  {step.label}
                </h3>
                <p className="text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
