import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { dashboardQuery, type DemandIntelligence } from "@/lib/analytics-queries";
import { compact } from "@/lib/format";

export const Route = createFileRoute("/admin/demand-intelligence")({
  head: () => ({
    meta: [
      { title: "Demand intelligence — ShopIQ Admin" },
      { name: "description", content: "Demand signals and stock risk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemandPage,
});

function riskTone(risk: string | null) {
  if (risk === "high") return "text-destructive border-destructive/40 bg-destructive/10";
  if (risk === "medium") return "text-warning border-warning/40 bg-warning/10";
  return "text-success border-success/40 bg-success/10";
}

function DemandPage() {
  const { data, isLoading } = useQuery(dashboardQuery);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Demand intelligence</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Demand and stock risk
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          High unmet signal + low stock = an order worth making today.
        </p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.demand ?? []).map((d: DemandIntelligence) => (
          <GlassCard key={d.product_id} className="p-6">
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.product_code} · {d.category}
                </p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${riskTone(d.demand_risk)}`}
              >
                {d.demand_risk ?? "ok"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>{compact(d.searches ?? 0)} searches</span>
              <span>{compact(d.try_ons ?? 0)} try-ons</span>
              <span>{compact(d.units_sold ?? 0)} sold</span>
              <span>{compact(d.available_units ?? 0)} in stock</span>
            </div>
            {Number(d.unmet_signal ?? 0) > 0 ? (
              <p className="mt-4 flex items-center gap-2 text-xs text-warning">
                <AlertTriangle className="size-3.5" /> Unmet demand signal{" "}
                {compact(d.unmet_signal ?? 0)}
              </p>
            ) : null}
          </GlassCard>
        ))}
        {(data?.demand ?? []).length === 0 ? (
          <GlassCard className="p-8 text-sm text-muted-foreground">
            No demand signals computed yet.
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}
