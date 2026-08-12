import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { RotateCcw, Shirt, Sparkles, Store, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { currentSession, endSession, isIdleExpired, touchSession } from "@/lib/session";
import { tryOnStore } from "@/lib/tryon-session";

const NAV = [
  { to: "/shop/search", label: "Search", icon: Search },
  { to: "/shop/assistant", label: "AI Stylist", icon: Sparkles },
  { to: "/shop/try-on", label: "Try-On", icon: Shirt },
  { to: "/shop/find-store", label: "Find in store", icon: Store },
] as const;

export function ShopShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(currentSession()?.code ?? null);
  }, [pathname]);

  // Shared-screen hygiene: wipe everything after inactivity.
  useEffect(() => {
    touchSession();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const onActivity = () => touchSession();
    events.forEach((e) => window.addEventListener(e, onActivity));
    const timer = window.setInterval(() => {
      if (isIdleExpired()) {
        void resetAll();
      }
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resetAll() {
    tryOnStore.end();
    await endSession();
    setCode(null);
    navigate({ to: "/shop" });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-4">
          <Link to="/shop" className="font-display text-2xl font-bold tracking-tight">
            SHOP<span className="text-aqua">IQ</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {code ? (
              <span className="hidden rounded-full border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground sm:inline">
                {code}
              </span>
            ) : null}
            <Button variant="glass" size="sm" onClick={() => void resetAll()}>
              <RotateCcw /> New session
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">{children}</main>

      <nav className="sticky bottom-0 z-40 border-t border-border/60 bg-background/70 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[0.65rem] text-muted-foreground"
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
