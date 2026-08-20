import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { catalogueQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/sales")({
  head: () => ({
    meta: [
      { title: "Sales — ShopIQ Admin" },
      { name: "description", content: "Sales records fed by POS/ERP integration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const { data: catalogue } = useQuery(catalogueQuery);
  const { data: rows, isLoading, error } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("sales")
        .select("id, product_id, store_id, units, total_value, unit_price, sold_at, source")
        .order("sold_at", { ascending: false })
        .limit(100);
      if (err) throw err;
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const products = new Map((catalogue?.products ?? []).map((p) => [p.id, p]));
  const stores = new Map((catalogue?.stores ?? []).map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Sales</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Recent transactions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Written by the POS/ERP integration, not by store screens. Updates automatically as new
          sales are recorded.
        </p>
      </div>

      {isLoading ? (
        <GlassCard className="flex items-center gap-3 p-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading sales…
        </GlassCard>
      ) : error ? (
        <GlassCard className="p-8 text-sm text-destructive">
          Sales data could not be loaded — this may be restricted to staff accounts.
        </GlassCard>
      ) : !rows || rows.length === 0 ? (
        <GlassCard className="p-10 text-center text-muted-foreground">
          No sales recorded yet — the POS feed has not pushed data.
        </GlassCard>
      ) : (
        <GlassCard className="overflow-x-auto p-2">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Unit price</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Sold at</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {products.get(r.product_id)?.name ?? "—"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {products.get(r.product_id)?.product_code ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">{stores.get(r.store_id)?.name ?? "—"}</td>
                  <td className="px-4 py-3">{r.units}</td>
                  <td className="px-4 py-3">{inr(Number(r.total_value))}</td>
                  <td className="px-4 py-3">{inr(Number(r.unit_price ?? 0))}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.source}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.sold_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
