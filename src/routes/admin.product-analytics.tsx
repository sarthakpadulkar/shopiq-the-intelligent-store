import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { GlassCard, SectionLabel } from "@/components/glass";
import { dashboardQuery } from "@/lib/analytics-queries";
import { compact, inr, pct } from "@/lib/format";

export const Route = createFileRoute("/admin/product-analytics")({
  head: () => ({
    meta: [
      { title: "Product analytics — ShopIQ Admin" },
      { name: "description", content: "Views, try-ons, conversions and revenue per product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductAnalyticsPage,
});

function ProductAnalyticsPage() {
  const { data, isLoading } = useQuery(dashboardQuery);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Product analytics</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Product performance
        </h1>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <GlassCard className="overflow-x-auto p-2">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Try-ons</th>
              <th className="px-4 py-3">View→try-on</th>
              <th className="px-4 py-3">Units sold</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Conv.</th>
              <th className="px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {(data?.products ?? []).map((p) => (
              <tr key={p.product_id} className="border-t border-border/50">
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.product_code} · {p.category} · {p.colour}
                  </span>
                </td>
                <td className="px-4 py-3">{compact(p.views ?? 0)}</td>
                <td className="px-4 py-3">{compact(p.try_ons ?? 0)}</td>
                <td className="px-4 py-3">{pct(p.view_to_tryon_pct)}</td>
                <td className="px-4 py-3">{compact(p.units_sold ?? 0)}</td>
                <td className="px-4 py-3">{inr(Number(p.revenue ?? 0))}</td>
                <td className="px-4 py-3">{pct(p.conversion_pct)}</td>
                <td className="px-4 py-3">{compact(p.available_units ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
