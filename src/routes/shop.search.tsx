import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, RefreshCcw, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { aiSearch } from "@/lib/ai.functions";
import { fetchCatalogue } from "@/lib/queries";
import { tryOnStore } from "@/lib/tryon-session";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/shop/search")({
  head: () => ({
    meta: [
      { title: "Search the store — ShopIQ" },
      {
        name: "description",
        content: "Describe what you want and ShopIQ finds it in this store's live catalogue.",
      },
      { property: "og:title", content: "Search the store — ShopIQ" },
      {
        property: "og:description",
        content: "Describe what you want and ShopIQ finds it in this store's live catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = [
  "black shirt for a wedding",
  "linen summer trousers",
  "something for a job interview",
];

interface AiResult {
  message: string;
  productIds: string[];
  degraded: boolean;
  mode: "ai" | "offline";
}

function SearchPage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [ai, setAi] = useState<AiResult | null>(null);
  const [searching, setSearching] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCatalogue,
  });

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data?.inventory ?? []) {
      map.set(row.product_id, (map.get(row.product_id) ?? 0) + row.available_units);
    }
    return map;
  }, [data]);

  const results = useMemo(() => {
    const products = data?.products ?? [];
    if (!query.trim()) return products;
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return products
      .map((p) => {
        const hay =
          `${p.name} ${p.category} ${p.colour} ${p.gender} ${p.description ?? ""}`.toLowerCase();
        const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }, [data, query]);

  const visible = useMemo(() => {
    if (!ai) return results;
    const ordered = new Map<string, Product>();
    for (const id of ai.productIds) {
      const p = data?.products.find((c) => c.id === id);
      if (p) ordered.set(id, p);
    }
    for (const p of results) if (!ordered.has(p.id)) ordered.set(p.id, p);
    return [...ordered.values()];
  }, [ai, results, data]);

  async function submit(value: string) {
    const trimmed = value.trim();
    setTerm(value);
    setQuery(trimmed);
    setAi(null);
    if (!trimmed) return;
    track("search_performed", { query: trimmed });
    setSearching(true);
    try {
      const res = await aiSearch({ data: { query: trimmed } });
      setAi({
        message: res.message,
        productIds: res.productIds,
        degraded: res.degraded,
        mode: res.mode,
      });
    } catch {
      setAi({
        message: `We couldn't reach the AI search right now. Showing keyword matches for "${trimmed}".`,
        productIds: [],
        degraded: true,
        mode: "offline",
      });
    } finally {
      setSearching(false);
    }
  }

  function onTryOn(product: Product) {
    tryOnStore.beginGenerating({
      productId: product.id,
      name: product.name,
      image: product.images[0]!,
      tryOnType: product.try_on_type,
    });
    navigate({ to: "/shop/try-on" });
  }

  return (
    <div className="space-y-8 py-4">
      <GlassCard className="p-6">
        <SectionLabel>Search</SectionLabel>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(term);
          }}
        >
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Describe what you're looking for…"
            className="h-12 flex-1 rounded-full bg-background/60 px-6"
          />
          <Button type="submit" variant="hero" size="lg" disabled={searching}>
            <Search /> {searching ? "Searching…" : "Search"}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void submit(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      {ai ? (
        <GlassCard className={`p-5 ${ai.degraded ? "border-warning/40" : "border-primary/30"}`}>
          <div className="flex items-start gap-3">
            {ai.degraded ? (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            ) : (
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            )}
            <div className="min-w-0">
              <p className="text-sm leading-relaxed">{ai.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ai.degraded
                  ? "AI search is temporarily unavailable — keyword match shown instead."
                  : ai.mode === "ai"
                    ? "AI-powered search result."
                    : "Keyword search result."}
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div>
        <SectionLabel>{query ? `Results for “${query}”` : "Full catalogue"}</SectionLabel>
        {isLoading || searching ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[460px] animate-pulse rounded-3xl bg-secondary/40" />
            ))}
          </div>
        ) : isError ? (
          <GlassCard className="mt-4 grid place-items-center p-10 text-center">
            <p className="font-display text-lg font-semibold">We couldn't load the catalogue</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
            <Button className="mt-5" variant="hero" onClick={() => refetch()}>
              <RefreshCcw /> Retry
            </Button>
          </GlassCard>
        ) : visible.length === 0 ? (
          <GlassCard className="mt-4 p-10 text-center text-muted-foreground">
            Nothing in this store matches that yet. Try different words or ask the AI stylist.
          </GlassCard>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                stock={stockByProduct.get(p.id) ?? 0}
                onTryOn={onTryOn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
