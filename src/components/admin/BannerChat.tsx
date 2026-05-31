"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getToolName, isToolUIPart } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Admin chat that drives the Canva banner agent. The model creates a design and
 * exports it; when generation finishes we ask the parent to refresh the grid so
 * the new banner (and its "Set live" control) appears below.
 */
export default function BannerChat({ onGenerated }: { onGenerated: () => void }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/admin/banners/chat" }),
    onFinish: () => onGenerated(),
  });

  const busy = status === "submitted" || status === "streaming";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Describe the banner you want — e.g.{" "}
            <span className="text-foreground">
              &ldquo;Make a promo banner for a $99 full detail special, book
              now.&rdquo;
            </span>{" "}
            I&apos;ll design it in Canva and store it. Then click{" "}
            <span className="text-foreground">Set live</span> below to publish it
            to the homepage.
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {m.role === "user" ? "You" : "Studio"}
            </p>
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p
                    key={i}
                    className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground"
                  >
                    {part.text}
                  </p>
                );
              }
              if (isToolUIPart(part)) {
                const name = getToolName(part);
                const label =
                  name === "create_banner_design"
                    ? "Designing in Canva…"
                    : name === "export_banner"
                      ? "Rendering & storing…"
                      : name;
                const done = part.state === "output-available";
                const failed = part.state === "output-error";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-line bg-background px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    <span
                      className={
                        failed
                          ? "text-destructive"
                          : done
                            ? "text-emerald-600"
                            : "text-amber-600"
                      }
                    >
                      {failed ? "✕" : done ? "✓" : "●"}
                    </span>
                    {failed ? `${label} failed` : done ? `${label} done` : label}
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}

        {error && (
          <p className="text-[13px] text-destructive">
            {error.message || "Something went wrong. Try again."}
          </p>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-line p-3 sm:p-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
          placeholder="Describe your banner…"
          className="min-h-20"
          disabled={busy}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={busy || !input.trim()}>
            {busy ? "Working…" : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
