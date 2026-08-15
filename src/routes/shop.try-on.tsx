import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";

import { CameraCapture } from "@/components/camera-capture";
import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { inr } from "@/lib/format";
import { fetchCatalogue } from "@/lib/queries";
import { generateTryOn } from "@/lib/tryon.functions";
import { hydrateTryOn, tryOnStore, useTryOn, type TryOnGarment } from "@/lib/tryon-session";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/shop/try-on")({
  head: () => ({
    meta: [
      { title: "Virtual Try-On — ShopIQ" },
      {
        name: "description",
        content: "Take one photo in store and preview any garment on yourself instantly.",
      },
      { property: "og:title", content: "Virtual Try-On — ShopIQ" },
      {
        property: "og:description",
        content: "Take one photo in store and preview any garment on yourself instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TryOnPage,
});

function toGarment(product: Product): TryOnGarment {
  return {
    productId: product.id,
    name: product.name,
    image: product.images[0]!,
    tryOnType: product.try_on_type,
  };
}

function TryOnPage() {
  const state = useTryOn();
  const { data, isLoading } = useQuery({ queryKey: ["catalogue"], queryFn: fetchCatalogue });

  useEffect(() => {
    hydrateTryOn();
  }, []);

  useEffect(() => {
    if (!state.personImage || !state.current || state.status !== "generating") return;
    const garment = state.current;

    if (state.results[garment.productId]) {
      tryOnStore.completed(garment, state.results[garment.productId]!);
      return;
    }

    let cancelled = false;
    const absoluteUrl = garment.image.startsWith("http")
      ? garment.image
      : `${window.location.origin}${garment.image}`;

    void (async () => {
      try {
        const res = await generateTryOn({
          data: {
            personImage: state.personImage!,
            garmentImageUrl: absoluteUrl,
            garmentName: garment.name,
            tryOnType: garment.tryOnType,
          },
        });
        if (cancelled) return;
        if (res.status === "ready" && res.image) {
          track("try_on_completed", { productId: garment.productId, metadata: { mode: "ai" } });
          tryOnStore.completed(garment, { image: res.image });
        } else {
          track("try_on_completed", {
            productId: garment.productId,
            metadata: { mode: "demo", reason: res.reason ?? "unavailable" },
          });
          tryOnStore.completed(garment, { demo: true, reason: res.reason ?? "unavailable" });
        }
      } catch {
        if (!cancelled) {
          track("try_on_completed", {
            productId: garment.productId,
            metadata: { mode: "demo", reason: "network" },
          });
          tryOnStore.completed(garment, { demo: true, reason: "network" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.personImage, state.current, state.status, state.results]);

  if (!state.personImage) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-4">
        <SectionLabel>Virtual try-on</SectionLabel>
        <CameraCapture
          onCapture={(dataUrl) => {
            tryOnStore.setPhoto(dataUrl);
            track("try_on_started");
          }}
        />
      </div>
    );
  }

  const result = state.current ? state.results[state.current.productId] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <SectionLabel>Virtual try-on</SectionLabel>

      <div className="grid gap-5 sm:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <img
            src={state.personImage}
            alt="Your try-on photo"
            className="aspect-[3/4] w-full object-cover"
          />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Your photo — reused for every garment.</p>
          </div>
        </GlassCard>

        {state.current ? (
          <ResultPanel />
        ) : (
          <GlassCard className="grid place-items-center p-8 text-center">
            <div>
              <Sparkles className="mx-auto size-10 text-primary" />
              <p className="mt-4 font-display text-lg font-semibold">Pick a garment below</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose anything from the store and it will be fitted onto your photo.
              </p>
            </div>
          </GlassCard>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <SectionLabel>Choose a garment</SectionLabel>
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              tryOnStore.end();
              track("try_on_started", { metadata: { action: "retake" } });
            }}
          >
            <Camera /> Retake photo
          </Button>
        </div>
        {isLoading ? (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 w-44 shrink-0 animate-pulse rounded-3xl bg-secondary/40"
              />
            ))}
          </div>
        ) : (
          <GarmentPicker />
        )}
      </div>
    </div>
  );
}

function ResultPanel() {
  const state = useTryOn();
  const garment = state.current!;
  const result = state.results[garment.productId];

  if (state.status === "generating" && !result) {
    return (
      <GlassCard className="grid place-items-center p-8 text-center">
        <div>
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <p className="mt-4 font-display text-lg font-semibold">
            Fitting {garment.name} onto your photo…
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This usually takes a few seconds. Nothing is stored.
          </p>
        </div>
      </GlassCard>
    );
  }

  if (state.status === "error" && !result) {
    return (
      <GlassCard className="grid place-items-center p-8 text-center">
        <div>
          <p className="font-display text-lg font-semibold">Something went wrong</p>
          <p className="mt-2 text-sm text-muted-foreground">{state.error}</p>
          <Button
            className="mt-5"
            variant="hero"
            onClick={() => tryOnStore.beginGenerating(garment)}
          >
            <RefreshCcw /> Try again
          </Button>
        </div>
      </GlassCard>
    );
  }

  if (!result) {
    return (
      <GlassCard className="grid place-items-center p-8 text-center">
        <p className="text-sm text-muted-foreground">Your try-on preview will appear here.</p>
      </GlassCard>
    );
  }

  if (result.demo || !result.image) {
    return (
      <GlassCard className="overflow-hidden">
        <div className="relative">
          <img
            src={garment.image}
            alt={garment.name}
            className="aspect-[3/4] w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-warning/95 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            Demo preview
          </span>
        </div>
        <div className="p-4 text-sm text-muted-foreground">
          Photorealistic try-on is not connected right now, so this is a garment preview on your
          photo. Enable the AI try-on provider to render the fitted look.
        </div>
        <ResultLink garmentName={garment.name} />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="relative">
        <img
          src={result.image}
          alt={`You wearing ${garment.name}`}
          className="aspect-[3/4] w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-accent/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
          AI-generated
        </span>
      </div>
      <ResultLink garmentName={garment.name} />
    </GlassCard>
  );
}

function ResultLink({ garmentName }: { garmentName?: string }) {
  return (
    <div className="p-4">
      <Button variant="glass" size="sm" className="w-full" asChild>
        <Link to="/shop/try-on/result">
          View full result {garmentName ? `— ${garmentName}` : ""}
        </Link>
      </Button>
    </div>
  );
}

function GarmentPicker() {
  const state = useTryOn();
  const navigate = useNavigate();
  const { data, isError, refetch } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCatalogue,
  });

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data?.inventory ?? []) {
      map.set(row.product_id, (map.get(row.product_id) ?? 0) + row.available_units);
    }
    return map;
  }, [data]);

  const garments = (data?.products ?? []).filter(
    (p) => p.try_on_type !== "accessory" && (stockByProduct.get(p.id) ?? 0) > 0,
  );

  if (isError) {
    return (
      <GlassCard className="mt-4 grid place-items-center p-8 text-center">
        <p className="font-display text-lg font-semibold">We couldn't load the garments</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <Button className="mt-5" variant="hero" onClick={() => refetch()}>
          <RefreshCcw /> Retry
        </Button>
      </GlassCard>
    );
  }

  if (garments.length === 0) {
    return (
      <GlassCard className="mt-4 p-8 text-center text-sm text-muted-foreground">
        No try-on-able garments are in stock right now.
      </GlassCard>
    );
  }

  function pick(product: Product) {
    const garment = toGarment(product);
    if (state.current?.productId === product.id && state.results[product.id]) {
      navigate({ to: "/shop/product/$id", params: { id: product.id } });
      return;
    }
    if (state.current?.productId !== product.id) {
      track("garment_changed", { productId: product.id });
    }
    tryOnStore.beginGenerating(garment);
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {garments.map((p) => {
        const isCurrent = state.current?.productId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p)}
            className={`group overflow-hidden rounded-3xl border bg-background/60 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 ${
              isCurrent ? "border-primary ring-2 ring-primary/40" : "border-border/70"
            }`}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary/40">
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute left-3 top-3 rounded-full border border-border/50 bg-background/70 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur">
                {isCurrent ? "On you" : "Try on"}
              </span>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="mt-0.5 text-sm text-lux">{inr(p.price)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
