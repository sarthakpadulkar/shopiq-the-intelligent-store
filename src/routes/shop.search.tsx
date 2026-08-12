import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { fetchCatalogue } from "@/lib/queries";
import { tryOnStore } from "@/lib/tryon-session";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/shop/search")({
  head: () => ({
    meta: [
      { title: "Search the store — ShopIQ" },
      { name: "description", content: "Describe what you want and ShopIQ finds it in this store's live catalogue." },
      { property: "og:title", content: "Search the store — ShopIQ" },
      { property: "og:description", content: "Describe what you want and ShopIQ finds it in this store's live catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = ["black shirt for a wedding", "linen summer trousers", "something for a job interview"];

function SearchPage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["catalogue"], queryFn: fetchCatalogue });

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
        const hay = `${p.name} ${p.category} ${p.colour} ${p.gender} ${p.fabric ?? ""} ${(p.tags ?? []).join(" ")} ${p.description ?? ""}`.toLowerCase();
        const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }, [data, query]);

  function submit(value: string) {
    setTerm(value);
    setQuery(value);
    if (value.trim()) track("search_performed", { query: value.trim() });
  }

  function onTryOn(product: Product) {
    tryOnStore.setGarment({
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
            submit(term);
          }}
        >
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Describe what you're looking for…"
            className="h-12 flex-1 rounded-full bg-background/60 px-6"
          />
          <Button type="submit" variant="hero" size="lg">
            <Search /> Search
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      <div>
        <SectionLabel>{query ? `Results for “${query}”` : "Full catalogue"}</SectionLabel>
        {isLoading ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[460px] animate-pulse rounded-3xl bg-secondary/40" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <GlassCard className="mt-4 p-10 text-center text-muted-foreground">
            Nothing in this store matches that yet. Try different words or ask the AI stylist.
          </GlassCard>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {results.map((p) => (
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
