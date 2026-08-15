import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Input } from "@/components/ui/input";
import { fetchCatalogue } from "@/lib/queries";
import { stockLabel, stockStatus } from "@/lib/format";

export const Route = createFileRoute("/shop/find-store")({
  head: () => ({
    meta: [
      { title: "Find it in store — ShopIQ" },
      {
        name: "description",
        content: "Live availability of every product across UrbanEdge stores.",
      },
      { property: "og:title", content: "Find it in store — ShopIQ" },
      {
        property: "og:description",
        content: "Live availability of every product across UrbanEdge stores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FindInStore,
});

function FindInStore() {
  const [term, setTerm] = useState("");
  const { data } = useQuery({ queryKey: ["catalogue"], queryFn: fetchCatalogue });

  const rows = useMemo(() => {
    const products = data?.products ?? [];
    const stores = data?.stores ?? [];
    const inv = data?.inventory ?? [];
    const t = term.trim().toLowerCase();
    return products
      .filter((p) => !t || `${p.name} ${p.product_code} ${p.colour}`.toLowerCase().includes(t))
      .map((p) => ({
        product: p,
        stores: stores.map((s) => ({
          store: s,
          units: inv
            .filter((i) => i.product_id === p.id && i.store_id === s.id)
            .reduce((a, i) => a + i.available_units, 0),
        })),
      }));
  }, [data, term]);

  return (
    <div className="space-y-6 py-4">
      <GlassCard className="p-6">
        <SectionLabel>Find in store</SectionLabel>
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Product name or code…"
          className="mt-4 h-12 rounded-full bg-background/60 px-6"
        />
      </GlassCard>

      <div className="space-y-4">
        {rows.slice(0, 20).map(({ product, stores }) => (
          <GlassCard key={product.id} className="p-5">
            <div className="flex items-center gap-4">
              <img
                src={product.images[0]}
                alt={product.name}
                width={64}
                height={80}
                className="size-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-display text-lg font-semibold">{product.name}</h3>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {product.product_code}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {stores.map(({ store, units }) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {store.name}
                  </span>
                  <span className="text-muted-foreground">
                    {units > 0 ? `${units} units` : stockLabel[stockStatus(units)]}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
