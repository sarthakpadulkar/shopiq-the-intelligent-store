import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { AnalyticsOverview } from "@/components/admin/analytics-overview";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { disableDemoMode } from "@/lib/demo-mode";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Brand Dashboard — ShopIQ" },
      {
        name: "description",
        content:
          "Live retail intelligence: product performance, category mix, store comparison, search demand and stock risk.",
      },
      { property: "og:title", content: "Brand Dashboard — ShopIQ" },
      {
        property: "og:description",
        content: "Live retail intelligence across products, categories, stores and demand signals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();

  async function signOut() {
    disableDemoMode();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-4">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            SHOP<span className="text-aqua">IQ</span>
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">Brand dashboard</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="glass" size="sm" asChild>
              <Link to="/admin/overview">Open admin module</Link>
            </Button>
            <Button variant="glass" size="sm" asChild>
              <Link to="/shop">In-store demo</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <AnalyticsOverview />
      </main>
    </div>
  );
}
