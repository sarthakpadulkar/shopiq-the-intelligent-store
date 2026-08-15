import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, RefreshCcw, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { ProductCard } from "@/components/product-card";
import { QrShare } from "@/components/qr-share";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { completeTheLook } from "@/lib/ai.functions";
import { inr, stockLabel, stockStatus } from "@/lib/format";
import { fetchCatalogue } from "@/lib/queries";
import { tryOnStore } from "@/lib/tryon-session";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/shop/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — ShopIQ" },
      {
        name: "description",
        content: "Live price, sizes and store-by-store availability for this product.",
      },
      { property: "og:title", content: "Product details — ShopIQ" },
      {
        property: "og:description",
        content: "Live price, sizes and store-by-store availability for this product.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCatalogue,
  });

  const product = data?.products.find((p) => p.id === id);
  const rows = (data?.inventory ?? []).filter((i) => i.product_id === id);
  const total = rows.reduce((a, i) => a + i.available_units, 0);

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data?.inventory ?? []) {
      map.set(row.product_id, (map.get(row.product_id) ?? 0) + row.available_units);
    }
    return map;
  }, [data]);

  const lookQuery = useQuery({
    queryKey: ["complete-the-look", id],
    queryFn: () => completeTheLook({ data: { productId: id } }),
    enabled: Boolean(product && product.try_on_type !== "accessory"),
  });

  const lookProducts = useMemo(() => {
    const ids = new Set(lookQuery.data?.productIds ?? []);
    return (data?.products ?? []).filter((p) => ids.has(p.id));
  }, [lookQuery.data, data]);

  if (isLoading) {
    return <div className="h-[60vh] animate-pulse rounded-3xl bg-secondary/40" />;
  }

  if (isError) {
    return (
      <GlassCard className="grid place-items-center p-10 text-center">
        <p className="font-display text-lg font-semibold">We couldn't load this product</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <Button className="mt-5" variant="hero" onClick={() => refetch()}>
          <RefreshCcw /> Retry
        </Button>
      </GlassCard>
    );
  }

  if (!product) {
    return (
      <GlassCard className="p-10 text-center text-muted-foreground">
        This product is no longer in the catalogue.
      </GlassCard>
    );
  }

  const tryThisOn = () => {
    track("product_selected", { productId: product.id });
    tryOnStore.beginGenerating({
      productId: product.id,
      name: product.name,
      image: product.images[0]!,
      tryOnType: product.try_on_type,
    });
    navigate({ to: "/shop/try-on" });
  };

  return (
    <div className="space-y-10 py-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover"
          />
        </GlassCard>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {product.category} · {product.product_code}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-3 font-display text-3xl text-lux">{inr(product.price)}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-3 py-1">{product.colour}</span>
            {product.sizes.map((s) => (
              <span key={s} className="rounded-full border border-border px-3 py-1">
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="hero"
              size="lg"
              onClick={() => track("find_in_store_clicked", { productId: product.id })}
            >
              Availability: {stockLabel[stockStatus(total)]}
            </Button>
            <QrShare path={`/shop/qr/${product.id}`} productId={product.id} />
          </div>

          {product.try_on_type !== "accessory" ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="hero"
                size="lg"
                disabled={stockStatus(total) === "out_of_stock"}
                onClick={tryThisOn}
              >
                <Camera /> Try this on
              </Button>
              {lookProducts.length > 0 ? (
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => {
                    track("recommendation_clicked", { productId: product.id });
                    document
                      .getElementById("complete-the-look")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Sparkles /> Complete the look
                </Button>
              ) : null}
            </div>
          ) : null}

          <div>
            <SectionLabel>In stock across stores</SectionLabel>
            <div className="mt-3 space-y-2">
              {(data?.stores ?? []).map((s) => {
                const units = rows
                  .filter((r) => r.store_id === s.id)
                  .reduce((a, r) => a + r.available_units, 0);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm"
                  >
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{units} units</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {product.try_on_type !== "accessory" && lookProducts.length > 0 ? (
        <div id="complete-the-look">
          <SectionLabel>Complete the look</SectionLabel>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {lookProducts.map((p: Product) => (
              <ProductCard
                key={p.id}
                product={p}
                stock={stockByProduct.get(p.id) ?? 0}
                onTryOn={(garment) => {
                  track("recommendation_clicked", { productId: garment.id });
                  tryOnStore.beginGenerating({
                    productId: garment.id,
                    name: garment.name,
                    image: garment.images[0]!,
                    tryOnType: garment.try_on_type,
                  });
                  navigate({ to: "/shop/try-on" });
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
