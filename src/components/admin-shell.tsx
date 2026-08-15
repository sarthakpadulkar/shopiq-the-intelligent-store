import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Eye,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { disableDemoMode } from "@/lib/demo-mode";

const NAV = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/stores", label: "Stores", icon: Store },
  { to: "/admin/sales", label: "Sales", icon: ShoppingBag },
  { to: "/admin/search-analytics", label: "Search analytics", icon: Search },
  { to: "/admin/product-analytics", label: "Product analytics", icon: Eye },
  { to: "/admin/demand-intelligence", label: "Demand intelligence", icon: TrendingUp },
  { to: "/admin/ai-insights", label: "AI insights", icon: Sparkles },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
          <span className="hidden text-sm text-muted-foreground sm:inline">Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="glass" size="sm" asChild>
              <Link to="/shop">In-store demo</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-6 py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <nav className="mb-2 flex gap-1 overflow-x-auto pb-1 lg:hidden">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
