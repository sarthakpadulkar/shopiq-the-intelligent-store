import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RefreshCcw } from "lucide-react";

import { GlassCard } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { inr, stockLabel, stockStatus } from "@/lib/format";
import { fetchCatalogue } from "@/lib/queries";

export const Route = createFileRoute("/shop/qr/$id")({
  head: () => ({
    meta: [
      { title: "Product — ShopIQ" },
      {
        name: "description",
        content: "View live price, sizes and availability of this product on your phone.",
      },
      { property: "og:title", content: "Product — ShopIQ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QrProductPage,
});

function QrProductPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCatalogue,
  });

  const product = data?.products.find((p) => p.id === id);
  const rows = (data?.inventory ?? []).filter((i) => i.product_id === id);
  const total = rows.reduce((a, i) => a + i.available_units, 0);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-sm py-6">
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-secondary/40" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-sm py-6">
        <GlassCard className="grid place-items-center p-10 text-center">
          <p className="font-display text-lg font-semibold">We couldn't load this product</p>
          <p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p>
          <Button className="mt-5" variant="hero" onClick={() => refetch()}>
            <RefreshCcw /> Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-sm py-6">
        <GlassCard className="p-10 text-center text-muted-foreground">
          This product is no longer in the catalogue.
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-4">
      <GlassCard className="overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {product.category} · {product.product_code}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-2 font-display text-2xl text-lux">{inr(product.price)}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-3 py-1">{product.colour}</span>
            {product.sizes.slice(0, 6).map((s) => (
              <span key={s} className="rounded-full border border-border px-3 py-1">
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm">
            <span>Availability</span>
            <span
              className={
                stockStatus(total) === "in_stock"
                  ? "text-success"
                  : stockStatus(total) === "low_stock"
                    ? "text-warning"
                    : "text-muted-foreground"
              }
            >
              {stockLabel[stockStatus(total)]}
            </span>
          </div>

          <Button asChild variant="hero" size="lg" className="w-full">
            <Link to="/shop/product/$id" params={{ id: product.id }}>
              View full details <ArrowRight />
            </Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
