import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { GlassCard, SectionLabel } from "@/components/glass";
import { QrShare } from "@/components/qr-share";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { inr, stockLabel, stockStatus } from "@/lib/format";
import { fetchCatalogue } from "@/lib/queries";

export const Route = createFileRoute("/shop/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — ShopIQ" },
      { name: "description", content: "Live price, sizes and store-by-store availability for this product." },
      { property: "og:title", content: "Product details — ShopIQ" },
      { property: "og:description", content: "Live price, sizes and store-by-store availability for this product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["catalogue"], queryFn: fetchCatalogue });

  const product = data?.products.find((p) => p.id === id);
  const rows = (data?.inventory ?? []).filter((i) => i.product_id === id);
  const total = rows.reduce((a, i) => a + i.available_units, 0);

  if (isLoading) {
    return <div className="h-[60vh] animate-pulse rounded-3xl bg-secondary/40" />;
  }

  if (!product) {
    return (
      <GlassCard className="p-10 text-center text-muted-foreground">
        This product is no longer in the catalogue.
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-8 py-4 lg:grid-cols-2">
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
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
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
          <QrShare path={`/shop/product/${product.id}`} productId={product.id} />
        </div>

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
  );
}
