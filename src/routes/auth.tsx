import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { enableDemoMode, isDemoMode } from "@/lib/demo-mode";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Login — ShopIQ" },
      {
        name: "description",
        content: "Sign in to the ShopIQ brand dashboard to view retail and demand intelligence.",
      },
      { property: "og:title", content: "Staff Login — ShopIQ" },
      {
        property: "og:description",
        content: "Sign in to the ShopIQ brand dashboard to view retail and demand intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isDemoMode()) {
      navigate({ to: "/dashboard" });
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  function fillDemoCredentials() {
    setEmail("demo@shopiq.com");
    setPassword("demo-password-123");
    toast.success("Demo credentials filled in. Click Sign in to continue.");
  }

  function signInDemo() {
    enableDemoMode();
    navigate({ to: "/dashboard" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          SHOP<span className="text-aqua">IQ</span>
        </Link>

        <GlassCard className="mt-6 p-8">
          <SectionLabel>Brand & store staff</SectionLabel>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dashboard access is role-gated. Shoppers never need an account.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="hero" className="flex-1" disabled={busy}>
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
              {mode === "signin" && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={fillDemoCredentials}
                  disabled={busy}
                >
                  Try demo
                </Button>
              )}
            </div>
          </form>

          <button
            type="button"
            className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button variant="glass" className="w-full" onClick={signInDemo}>
            <Sparkles /> Explore with demo staff login
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            No credentials needed — opens the dashboard with sample data.
            <br />
            <span className="text-aqua font-medium">
              Or use: demo@shopiq.com / demo-password-123
            </span>
          </p>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Looking for the in-store experience?{" "}
          <Link to="/shop" className="text-primary hover:underline">
            Open the shopper demo
          </Link>
        </p>
      </div>
    </div>
  );
}
