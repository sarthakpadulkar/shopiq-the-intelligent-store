import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Camera,
  Eye,
  QrCode,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { DemoBadge, GlassCard, SectionLabel, StatTile } from "@/components/glass";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardQuery, type DemandIntelligence } from "@/lib/analytics-queries";
import { compact, inr, pct } from "@/lib/format";

function riskTone(risk: string | null) {
  if (risk === "high") return "text-destructive border-destructive/40 bg-destructive/10";
  if (risk === "medium") return "text-warning border-warning/40 bg-warning/10";
  return "text-success border-success/40 bg-success/10";
}

function Bar({ value, max }: { value: number; max: number }) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-muted/40">
      <div
        className="h-2 rounded-full bg-[image:var(--gradient-primary)]"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

export function AnalyticsOverview() {
  const { data, isLoading, error } = useQuery(dashboardQuery);

  const s = data?.summary;
  const maxSearch = Math.max(1, ...(data?.searches ?? []).map((r) => r.searches ?? 0));
  const maxCat = Math.max(1, ...(data?.categories ?? []).map((r) => Number(r.revenue ?? 0)));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <SectionLabel>Retail intelligence</SectionLabel>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            What the floor is telling you
          </h1>
        </div>
        <DemoBadge className="ml-auto" />
      </div>

      {error ? (
        <GlassCard className="mt-8 p-8">
          <p className="text-sm text-destructive">
            Analytics are restricted to staff accounts. Ask an admin to grant your account a staff
            role.
          </p>
        </GlassCard>
      ) : null}

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading analytics…</p> : null}

      {data && data.products.length === 0 && !data.summary ? (
        <GlassCard className="mt-8 p-8">
          <h2 className="font-display text-xl font-semibold">Awaiting staff access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but has no brand or store role yet, so analytics are hidden.
            An administrator needs to assign your role before data appears here.
          </p>
        </GlassCard>
      ) : null}

      {data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Revenue"
              value={inr(Number(s?.revenue ?? 0))}
              hint={`${compact(s?.units_sold ?? 0)} units sold`}
              icon={<ShoppingBag className="size-5" />}
            />
            <StatTile
              label="Sessions"
              value={compact(s?.total_sessions ?? 0)}
              hint={`${compact(s?.total_interactions ?? 0)} interactions`}
              icon={<BarChart3 className="size-5" />}
            />
            <StatTile
              label="Searches"
              value={compact(s?.searches ?? 0)}
              hint={`${compact(s?.ai_conversations ?? 0)} AI conversations`}
              icon={<Search className="size-5" />}
            />
            <StatTile
              label="Try-ons"
              value={compact(s?.try_ons ?? 0)}
              hint={`${compact(s?.qr_scans ?? 0)} QR handoffs`}
              icon={<Camera className="size-5" />}
            />
          </div>

          <Tabs defaultValue="products" className="mt-10">
            <TabsList className="flex-wrap">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="searches">Search demand</TabsTrigger>
              <TabsTrigger value="risk">Stock risk</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <GlassCard className="overflow-x-auto p-2">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Views</th>
                      <th className="px-4 py-3">Try-ons</th>
                      <th className="px-4 py-3">View→try-on</th>
                      <th className="px-4 py-3">Units</th>
                      <th className="px-4 py-3">Revenue</th>
                      <th className="px-4 py-3">Conv.</th>
                      <th className="px-4 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p) => (
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
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-2">
                {data.categories.map((c) => (
                  <GlassCard key={c.category} className="p-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-semibold capitalize">
                        {c.category}
                      </h3>
                      <span className="ml-auto font-display text-lg">
                        {inr(Number(c.revenue ?? 0))}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Bar value={Number(c.revenue ?? 0)} max={maxCat} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>
                        <Eye className="mb-1 size-3.5" /> {compact(c.views ?? 0)} views
                      </span>
                      <span>
                        <Camera className="mb-1 size-3.5" /> {compact(c.try_ons ?? 0)} try-ons
                      </span>
                      <span>
                        <ShoppingBag className="mb-1 size-3.5" /> {compact(c.units_sold ?? 0)} units
                      </span>
                      <span>
                        <TrendingUp className="mb-1 size-3.5" /> {pct(c.conversion_pct)} conv.
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stores" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.stores.map((st) => (
                  <GlassCard key={st.store_id} className="p-6">
                    <p className="font-display text-lg font-semibold">{st.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {st.code} · {st.city}
                    </p>
                    <p className="mt-4 font-display text-2xl">{inr(Number(st.revenue ?? 0))}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>{compact(st.sessions ?? 0)} sessions</span>
                      <span>{compact(st.interactions ?? 0)} interactions</span>
                      <span>{compact(st.try_ons ?? 0)} try-ons</span>
                      <span>{pct(st.conversion_pct)} conversion</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="searches" className="mt-6">
              <GlassCard className="p-6">
                <p className="text-sm text-muted-foreground">
                  What shoppers actually asked the store, ranked by volume.
                </p>
                <ul className="mt-5 space-y-4">
                  {data.searches.map((q) => (
                    <li key={q.query}>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="truncate">{q.query}</span>
                        <span className="ml-auto font-mono text-xs text-muted-foreground">
                          {compact(q.searches ?? 0)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Bar value={q.searches ?? 0} max={maxSearch} />
                      </div>
                    </li>
                  ))}
                  {data.searches.length === 0 ? (
                    <li className="text-sm text-muted-foreground">No searches recorded yet.</li>
                  ) : null}
                </ul>
              </GlassCard>
            </TabsContent>

            <TabsContent value="risk" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.demand.map((d: DemandIntelligence) => (
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
              </div>
            </TabsContent>
          </Tabs>

          <p className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
            <QrCode className="size-3.5" /> Figures aggregate anonymous in-store sessions and demo
            POS data. No shopper is ever identified.
          </p>
        </>
      ) : null}
    </div>
  );
}
