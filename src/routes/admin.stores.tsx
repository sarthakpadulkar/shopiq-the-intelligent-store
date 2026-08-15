import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { dashboardQuery } from "@/lib/analytics-queries";
import { compact, inr, pct } from "@/lib/format";
import { catalogueQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/stores")({
  head: () => ({
    meta: [
      { title: "Stores — ShopIQ Admin" },
      { name: "description", content: "Multi-store comparison." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  const { data: analytics, isLoading } = useQuery(dashboardQuery);
  const { data: catalogue } = useQuery(catalogueQuery);

  const statsByStore = new Map((analytics?.stores ?? []).map((s) => [s.store_id, s]));
  const stockByStore = new Map<string, number>();
  for (const row of catalogue?.inventory ?? []) {
    stockByStore.set(row.store_id, (stockByStore.get(row.store_id) ?? 0) + row.available_units);
  }

  if (isLoading) {
    return <div className="h-[60vh] animate-pulse rounded-3xl bg-secondary/40" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Stores</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Store comparison
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {catalogue?.stores.length ?? 0} stores ·{" "}
          {compact([...stockByStore.values()].reduce((a, b) => a + b, 0))} units on floor
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(catalogue?.stores ?? []).map((s) => {
          const st = statsByStore.get(s.id);
          return (
            <GlassCard key={s.id} className="p-6">
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{s.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {s.address ?? s.city} · {s.code}
                  </p>
                </div>
              </div>
              <p className="mt-4 font-display text-2xl">{inr(Number(st?.revenue ?? 0))}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <span>{compact(st?.sessions ?? 0)} sessions</span>
                <span>{compact(st?.try_ons ?? 0)} try-ons</span>
                <span>{compact(st?.units_sold ?? 0)} sold</span>
                <span>{compact(stockByStore.get(s.id) ?? 0)} in stock</span>
                <span>{pct(st?.conversion_pct)} conversion</span>
                <span>{compact(st?.interactions ?? 0)} interactions</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
