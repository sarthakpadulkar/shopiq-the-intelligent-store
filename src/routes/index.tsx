import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Camera,
  Cpu,
  LineChart,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

import { DemoBadge, GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopIQ — AI Retail Intelligence for Physical Stores" },
      {
        name: "description",
        content:
          "ShopIQ turns any store floor into an AI experience: conversational search, virtual try-on and live demand intelligence for retail brands.",
      },
      { property: "og:title", content: "ShopIQ — AI Retail Intelligence for Physical Stores" },
      {
        property: "og:description",
        content:
          "Conversational product search, virtual try-on and real-time demand intelligence for physical retail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Search,
    title: "Conversational search",
    copy: "Shoppers describe what they want in plain language. ShopIQ answers only with products that actually exist and are in stock.",
  },
  {
    icon: Camera,
    title: "Virtual try-on",
    copy: "One camera capture, unlimited garments. No fitting-room queue, no photo ever leaves the session.",
  },
  {
    icon: Sparkles,
    title: "AI stylist",
    copy: "Complete-the-look styling grounded in the live catalogue, so every suggestion is buyable today.",
  },
  {
    icon: Store,
    title: "Find in store",
    copy: "Floor, section and rack for every size, across every store in the network.",
  },
  {
    icon: QrCode,
    title: "QR handoff",
    copy: "Shoppers carry the look to their phone in one scan — no app install, no sign-up.",
  },
  {
    icon: LineChart,
    title: "Demand intelligence",
    copy: "See what shoppers ask for but you don't stock, and act before the season ends.",
  },
] as const;

const METRICS = [
  { value: "3.4x", label: "More product discovery per visit" },
  { value: "-62%", label: "Fitting-room wait time" },
  { value: "100%", label: "Anonymous — no shopper PII" },
  { value: "6", label: "Live demo stores" },
] as const;

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-6">
        <span className="font-display text-2xl font-bold tracking-tight">
          SHOP<span className="text-aqua">IQ</span>
        </span>
        <nav className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Staff login</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/shop">Launch in-store demo</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24">
        <section className="py-16 text-center sm:py-24">
          <DemoBadge className="mx-auto" />
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            The physical store, <span className="text-lux">finally intelligent</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ShopIQ is the AI layer for retail floors. Shoppers search, style and try on in seconds.
            Brands get live demand intelligence from every interaction — without collecting a single
            piece of personal data.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button variant="hero" size="xl" asChild>
              <Link to="/shop">
                <Sparkles /> Try the shopper experience
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/auth">
                <BarChart3 /> See the brand dashboard
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((m) => (
              <GlassCard key={m.label} className="p-6">
                <p className="font-display text-4xl font-bold text-lux">{m.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="py-12">
          <SectionLabel>Platform</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight">
            Everything a shopper needs on the floor, everything a brand needs behind it
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((f) => (
              <GlassCard key={f.title} interactive className="p-7">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="py-12">
          <SectionLabel>How it works</SectionLabel>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Shopper walks up",
                copy: "An anonymous session starts on the in-store screen. No login, no personal data, auto-wiped when idle.",
              },
              {
                step: "02",
                title: "AI does the work",
                copy: "Search, styling and try-on run against your live catalogue and stock, so nothing suggested is unavailable.",
              },
              {
                step: "03",
                title: "Brand learns",
                copy: "Every search, view and try-on flows into product, category, store and demand-risk analytics.",
              },
            ].map((s) => (
              <GlassCard key={s.step} className="p-7">
                <span className="font-mono text-xs tracking-[0.3em] text-accent">{s.step}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="py-12">
          <GlassCard className="grid gap-8 p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionLabel>Privacy by design</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                Intelligence without surveillance
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sessions are anonymous and short-lived. Try-on captures stay in the browser session
                and are cleared automatically. Analytics are aggregated at product, category and
                store level — never at person level.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, label: "No shopper accounts or PII" },
                { icon: Cpu, label: "Catalogue-grounded AI, zero hallucinated products" },
                { icon: Store, label: "Store-level stock accuracy" },
                { icon: BarChart3, label: "Role-gated brand analytics" },
              ].map((i) => (
                <div key={i.label} className="flex items-start gap-3 rounded-2xl bg-muted/30 p-4">
                  <i.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{i.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="py-16 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight">
            Ready to see it on your floor?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Explore the full demo with the fictional UrbanEdge brand — 20 products, 6 stores and 90
            days of engagement data.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop">Open shopper demo</Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/auth">Staff login</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-6 text-xs text-muted-foreground">
          <span className="font-display text-sm font-semibold text-foreground">
            SHOP<span className="text-aqua">IQ</span>
          </span>
          <span>AI retail intelligence platform</span>
          <span className="ml-auto">Demo environment — all data is fictional.</span>
        </div>
      </footer>
    </div>
  );
}
