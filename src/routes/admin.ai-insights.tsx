import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { GlassCard, SectionLabel, StatTile } from "@/components/glass";
import { dashboardQuery } from "@/lib/analytics-queries";
import { compact } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI insights — ShopIQ Admin" },
      { name: "description", content: "AI assistant usage and provider status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  const { data } = useQuery(dashboardQuery);
  const [interactions, setInteractions] = useState<
    Array<{ id: string; role: string; content: string; created_at: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase
      .from("ai_interactions")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data: rows, error: err }) => {
        if (cancelled) return;
        if (err) setError("AI conversation history is restricted to staff accounts.");
        else setInteractions((rows ?? []) as never[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>AI insights</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Assistant usage &amp; health
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="AI conversations"
          value={compact(data?.summary?.ai_conversations ?? 0)}
          hint="assistant messages"
          icon={<Sparkles className="size-5" />}
        />
        <StatTile
          label="Search requests"
          value={compact(data?.summary?.searches ?? 0)}
          hint="including AI search"
          icon={<Cpu className="size-5" />}
        />
      </div>

      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold">Provider status</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            Model: Lovable AI gateway (
            <code className="rounded bg-muted px-1.5 py-0.5">ai.gateway.lovable.dev</code>
            ).
          </li>
          <li>
            Key: the server reads{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">LOVABLE_API_KEY</code> from the
            environment — never exposed to the browser.
          </li>
          <li>
            When the key is missing or the provider is slow, the store screens fall back to keyword
            search and clearly-marked demo try-on previews.
          </li>
        </ul>
      </GlassCard>

      {error ? <GlassCard className="p-6 text-sm text-destructive">{error}</GlassCard> : null}

      <GlassCard className="overflow-x-auto p-2">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((i) => (
              <tr key={i.id} className="border-t border-border/50">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {new Date(i.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{i.role}</td>
                <td className="px-4 py-3 text-sm">{i.content.slice(0, 160)}</td>
              </tr>
            ))}
            {interactions.length === 0 && !error ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No AI conversations yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
