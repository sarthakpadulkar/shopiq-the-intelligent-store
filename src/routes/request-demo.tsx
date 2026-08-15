import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/request-demo")({
  head: () => ({
    meta: [
      { title: "Request a demo — ShopIQ" },
      { name: "description", content: "See ShopIQ on your retail floor." },
      { property: "og:title", content: "Request a demo — ShopIQ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestDemoPage,
});

function RequestDemoPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", stores: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!form.name.trim() || !emailOk) {
      setError("Please add your name and a valid work email.");
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-6">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          SHOP<span className="text-aqua">IQ</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="glass" size="sm" asChild>
            <Link to="/shop">Launch in-store demo</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24">
        <div className="mx-auto max-w-xl py-12">
          <div className="text-center">
            <SectionLabel>Request a demo</SectionLabel>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
              See ShopIQ on your floor
            </h1>
            <p className="mt-3 text-muted-foreground">
              A 20-minute walkthrough with your catalogue, your stores and your questions.
            </p>
          </div>

          {submitted ? (
            <GlassCard className="mt-10 p-10 text-center">
              <CheckCircle2 className="mx-auto size-10 text-success" />
              <h2 className="mt-4 font-display text-2xl font-semibold">
                Thanks, {form.name.trim().split(" ")[0]}!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We've noted a demo request for <span className="text-foreground">{form.email}</span>
                .
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                This is a demo build — no message is actually sent. Connect a CRM or email service
                to route real leads.
              </p>
              <Button variant="glass" className="mt-6" asChild>
                <Link to="/shop">Explore the in-store demo</Link>
              </Button>
            </GlassCard>
          ) : (
            <GlassCard className="mt-10 p-8">
              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Priya Sharma"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Work email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="priya@brand.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Company / brand</Label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="UrbanEdge (demo)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Number of stores</Label>
                  <Input
                    inputMode="numeric"
                    value={form.stores}
                    onChange={(e) => setForm({ ...form, stores: e.target.value })}
                    placeholder="6"
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Request demo
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No spam. No personal data is stored by this demo.
                </p>
              </form>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  );
}
