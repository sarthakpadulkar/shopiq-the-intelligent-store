import { Link } from "@tanstack/react-router";
import { Camera, Eye } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass";
import { track } from "@/lib/analytics";
import { inr, stockLabel, stockStatus } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  stock,
  onTryOn,
}: {
  product: Product;
  stock: number;
  onTryOn?: (product: Product) => void;
}) {
  const status = stockStatus(stock);
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    track("product_impression", { productId: product.id });
  }, [product.id]);

  const tone =
    status === "in_stock"
      ? "text-success border-success/40 bg-success/10"
      : status === "low_stock"
        ? "text-warning border-warning/40 bg-warning/10"
        : "text-muted-foreground border-border bg-muted/40";

  return (
    <GlassCard interactive className="group flex flex-col overflow-hidden">
      <Link
        to="/shop/product/$id"
        params={{ id: product.id }}
        onClick={() => track("product_viewed", { productId: product.id })}
        className="relative block aspect-[4/5] overflow-hidden bg-secondary/40"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={768}
          height={960}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <span
          className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] backdrop-blur ${tone}`}
        >
          {stockLabel[status]}
        </span>
        {product.is_new_arrival ? (
          <span className="absolute right-4 top-4 rounded-full bg-accent/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
            New
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category} · {product.product_code}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{product.name}</h3>
        </div>

        <p className="font-display text-xl text-lux">{inr(product.price)}</p>

        <div className="flex flex-wrap gap-1.5 text-[0.68rem] text-muted-foreground">
          <span className="rounded-full border border-border px-2 py-0.5">{product.colour}</span>
          {product.sizes.slice(0, 5).map((s) => (
            <span key={s} className="rounded-full border border-border px-2 py-0.5">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-2">
          <Button asChild variant="glass" size="sm" className="flex-1">
            <Link
              to="/shop/product/$id"
              params={{ id: product.id }}
              onClick={() => track("product_viewed", { productId: product.id })}
            >
              <Eye /> View
            </Link>
          </Button>
          {product.try_on_type !== "accessory" && onTryOn ? (
            <Button
              variant="hero"
              size="sm"
              className="flex-1"
              disabled={status === "out_of_stock"}
              onClick={() => {
                track("product_selected", { productId: product.id });
                onTryOn(product);
              }}
            >
              <Camera /> Try on
            </Button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
