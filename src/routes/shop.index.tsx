import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Search, Sparkles, Store } from "lucide-react";

import { DemoBadge, GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { startSession } from "@/lib/session";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Welcome to ShopIQ" },
      {
        name: "description",
        content: "Start an anonymous in-store session with the ShopIQ AI retail assistant.",
      },
      { property: "og:title", content: "Welcome to ShopIQ" },
      {
        property: "og:description",
        content: "Start an anonymous in-store session with the ShopIQ AI retail assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopWelcome,
});

const ENTRIES = [
  {
    to: "/shop/search",
    icon: Search,
    title: "Find a product",
    copy: "Describe it in your own words.",
  },
  {
    to: "/shop/assistant",
    icon: Sparkles,
    title: "Ask the AI stylist",
    copy: "Outfit advice for any occasion.",
  },
  {
    to: "/shop/try-on",
    icon: Camera,
    title: "Virtual try-on",
    copy: "One photo, unlimited garments.",
  },
  {
    to: "/shop/find-store",
    icon: Store,
    title: "Find in store",
    copy: "See which aisle has your size.",
  },
] as const;

function ShopWelcome() {
  const navigate = useNavigate();

  async function begin(to: (typeof ENTRIES)[number]["to"]) {
    await startSession();
    navigate({ to });
  }

  return (
    <div className="space-y-12 py-6">
      <div className="mx-auto max-w-2xl text-center">
        <DemoBadge className="mx-auto" />
        <h1 className="mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Your AI-powered <span className="text-lux">shopping assistant</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          No login. No personal data. Just tell us what you are looking for and the store answers
          instantly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            variant="hero"
            size="lg"
            onClick={() => void begin("/shop/search")}
            className="min-w-44"
          >
            Start shopping
          </Button>
          <Button variant="glass" size="lg" asChild>
            <Link to="/">Explore ShopIQ</Link>
          </Button>
        </div>
      </div>

      <div>
        <SectionLabel>Start here</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ENTRIES.map((e) => (
            <GlassCard key={e.to} interactive className="p-6">
              <e.icon className="size-7 text-primary" />
              <h2 className="mt-4 font-display text-xl font-semibold">{e.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{e.copy}</p>
              <Button variant="hero" className="mt-5 w-full" onClick={() => void begin(e.to)}>
                Continue
              </Button>
            </GlassCard>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Sessions clear automatically after a few minutes of inactivity.{" "}
        <Link to="/" className="underline">
          About ShopIQ
        </Link>
      </p>
    </div>
  );
}
