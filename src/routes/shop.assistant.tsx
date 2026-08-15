import { createFileRoute } from "@tanstack/react-router";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assistantReply } from "@/lib/ai.functions";
import { trackAiMessage } from "@/lib/analytics";

export const Route = createFileRoute("/shop/assistant")({
  head: () => ({
    meta: [
      { title: "AI Stylist — ShopIQ" },
      {
        name: "description",
        content: "Chat with the ShopIQ stylist for outfit advice grounded in this store's stock.",
      },
      { property: "og:title", content: "AI Stylist — ShopIQ" },
      {
        property: "og:description",
        content: "Chat with the ShopIQ stylist for outfit advice grounded in this store's stock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assistant,
});

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! Tell me about the occasion — a wedding, a first day at work, a weekend trip — and I'll put a look together from what's on the floor right now.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    trackAiMessage("user", text);
    setBusy(true);
    try {
      const res = await assistantReply({
        data: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      const reply = res.message;
      setMessages([...next, { role: "assistant", content: reply }]);
      trackAiMessage("assistant", reply);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "I couldn't reach the stylist just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 py-4">
      <SectionLabel>AI stylist</SectionLabel>
      <GlassCard className="flex h-[70vh] flex-col p-5">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-primary/15 text-foreground"
                  : "border border-border/70 bg-background/50"
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 animate-pulse" /> Styling…
            </div>
          ) : null}
        </div>

        <form onSubmit={send} className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for an outfit…"
            className="h-12 flex-1 rounded-full bg-background/60 px-6"
          />
          <Button type="submit" variant="hero" size="lg" disabled={busy}>
            <Send /> Send
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
