import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { GlassCard, SectionLabel } from "@/components/glass";
import { dashboardQuery } from "@/lib/analytics-queries";
import { compact, inr, pct } from "@/lib/format";

export const Route = createFileRoute("/admin/search-analytics")({
  head: () => ({
    meta: [
      { title: "Search analytics — ShopIQ Admin" },
      { name: "description", content: "What shoppers asked for, ranked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchAnalyticsPage,
});

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

function SearchAnalyticsPage() {
  const { data, isLoading } = useQuery(dashboardQuery);
  const max = Math.max(1, ...(data?.searches ?? []).map((r) => r.searches ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Search analytics</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          What shoppers ask for
        </h1>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <GlassCard className="p-6">
        <ul className="space-y-4">
          {(data?.searches ?? []).map((q) => (
            <li key={q.query}>
              <div className="flex items-center gap-3 text-sm">
                <span className="truncate">{q.query}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {compact(q.searches ?? 0)}
                </span>
              </div>
              <div className="mt-2">
                <Bar value={q.searches ?? 0} max={max} />
              </div>
            </li>
          ))}
          {(data?.searches ?? []).length === 0 ? (
            <li className="py-8 text-center text-sm text-muted-foreground">
              No searches recorded yet.
            </li>
          ) : null}
        </ul>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.categories ?? []).map((c) => (
          <GlassCard key={c.category} className="p-6">
            <p className="font-display text-lg font-semibold capitalize">{c.category}</p>
            <p className="mt-3 font-display text-2xl">{compact(c.views ?? 0)} views</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>{inr(Number(c.revenue ?? 0))} revenue</span>
              <span>{pct(c.conversion_pct)} conversion</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
