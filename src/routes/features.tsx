import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  LineChart,
  Plug,
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ShopIQ" },
      {
        name: "description",
        content: "AI shopping, virtual try-on, find in store and retail intelligence.",
      },
      { property: "og:title", content: "Features — ShopIQ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeaturesPage,
});

const SECTIONS = [
  {
    icon: Search,
    title: "AI shopping",
    copy: "Shoppers describe what they want in plain language — “black shirt for a wedding” — and the store answers with real, in-stock products. Every result is grounded in your live catalogue, so nothing suggested is unavailable or hallucinated.",
  },
  {
    icon: Camera,
    title: "Virtual try-on",
    copy: "One camera capture, unlimited garments. The shopper's photo stays in the browser session and is reused for every fit — no fitting-room queue, no photos stored on a server.",
  },
  {
    icon: Sparkles,
    title: "Complete the look",
    copy: "The AI stylist pairs any product with complementary items from the same catalogue — tops with bottoms, dresses with accessories — and every suggestion can be tried on instantly.",
  },
  {
    icon: Store,
    title: "Find in store",
    copy: "Floor, section and rack for every product, across every store in the network. Staff always know where the stock is — and shoppers can see it on their phone.",
  },
  {
    icon: QrCode,
    title: "QR handoff",
    copy: "One scan moves the look from the in-store screen to a shopper's phone. No app install, no account, no personal data exchanged.",
  },
  {
    icon: LineChart,
    title: "Demand intelligence",
    copy: "Searches without a purchase, try-ons without a conversion and products running low surface as actionable stock-risk signals — before the season ends.",
  },
  {
    icon: ShoppingBag,
    title: "Sales analytics",
    copy: "Revenue, units, conversion and product/category/store breakdowns, fed by the POS/ERP integration and role-gated to staff.",
  },
  {
    icon: Plug,
    title: "POS/ERP integration",
    copy: "A clean integration abstraction keeps ShopIQ decoupled from any single provider. Swap POS vendors without touching the store experience.",
  },
] as const;

function FeaturesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-6">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          SHOP<span className="text-aqua">IQ</span>
        </Link>
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
        <section className="py-14 text-center">
          <SectionLabel>Platform</SectionLabel>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Everything a shopper needs on the floor. Everything a brand needs behind it.
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map((s) => (
            <GlassCard key={s.title} interactive className="p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                <s.icon className="size-5" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
            </GlassCard>
          ))}
        </section>

        <section className="py-16 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight">
            Try it on your floor today
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/request-demo">Request a demo</Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/shop">Open shopper demo</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
