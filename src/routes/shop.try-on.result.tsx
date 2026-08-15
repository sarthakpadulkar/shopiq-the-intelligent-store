import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Shirt } from "lucide-react";
import { useEffect } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { hydrateTryOn, useTryOn } from "@/lib/tryon-session";

export const Route = createFileRoute("/shop/try-on/result")({
  head: () => ({
    meta: [
      { title: "Try-on result — ShopIQ" },
      { name: "description", content: "Your virtual try-on result." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TryOnResultPage,
});

function TryOnResultPage() {
  const state = useTryOn();

  useEffect(() => {
    hydrateTryOn();
  }, []);

  const garment = state.current;
  const result = garment ? state.results[garment.productId] : null;

  if (!garment || !result || state.status !== "ready") {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-4">
        <SectionLabel>Try-on result</SectionLabel>
        <GlassCard className="p-10 text-center">
          <Shirt className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-display text-lg font-semibold">No try-on result yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Take a photo and pick a garment to generate a result first.
          </p>
          <Button variant="hero" className="mt-6" asChild>
            <Link to="/shop/try-on">
              <Camera /> Open try-on
            </Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-4">
      <SectionLabel>Try-on result</SectionLabel>

      <div className="grid gap-5 sm:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <img
            src={state.personImage ?? undefined}
            alt="Your photo"
            className="aspect-[3/4] w-full object-cover"
          />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Your photo</p>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          {result.image ? (
            <img
              src={result.image}
              alt={`You wearing ${garment.name}`}
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <img
              src={garment.image}
              alt={garment.name}
              className="aspect-[3/4] w-full object-cover"
            />
          )}
          <div className="p-4">
            <p className="text-sm font-medium">{garment.name}</p>
            {result.demo ? (
              <p className="mt-1 text-xs text-warning">
                Demo preview — connect an AI try-on provider for a photorealistic fit.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">AI-generated fit</p>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild>
          <Link to="/shop/try-on">
            <Camera /> Try another garment
          </Link>
        </Button>
        {garment.tryOnType !== "accessory" ? (
          <Button variant="glass" asChild>
            <Link to="/shop/product/$id" params={{ id: garment.productId }}>
              View {garment.name}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
