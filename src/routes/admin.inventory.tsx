import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { stockLabel, stockStatus } from "@/lib/format";
import { catalogueQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — ShopIQ Admin" },
      { name: "description", content: "Per-store stock, sections and rack locations." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { data, isLoading } = useQuery(catalogueQuery);
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const products = new Map((data?.products ?? []).map((p) => [p.id, p]));
  const stores = new Map((data?.stores ?? []).map((s) => [s.id, s]));
  const rows = data?.inventory ?? [];

  const soldByInventory = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(`${row.product_id}:${row.store_id}`, 0);
    }
    return map;
  }, [rows]);

  const { data: salesData } = useQuery({
    queryKey: ["inventory-sales"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sales")
        .select("product_id, store_id, units");
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const soldMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const sale of salesData ?? []) {
      const key = `${sale.product_id}:${sale.store_id}`;
      map.set(key, (map.get(key) ?? 0) + sale.units);
    }
    return map;
  }, [salesData]);

  async function saveUnits(id: string, productId: string, storeId: string) {
    const value = Number(edits[id]);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid unit count.");
      return;
    }
    setSaving(id);
    const { error } = await supabase
      .from("inventory")
      .update({ available_units: value })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast.error("Update blocked by your role. Admins can adjust stock.");
      return;
    }
    audit("inventory.update", "inventory", id, { available_units: value });
    toast.success("Stock updated.");
    setEdits((e) => {
      const next = { ...e };
      delete next[id];
      return next;
    });
    await queryClient.invalidateQueries({ queryKey: ["catalogue"] });
  }

  if (isLoading) {
    return <div className="h-[60vh] animate-pulse rounded-3xl bg-secondary/40" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Inventory</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Stock by store</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Click a unit count to adjust it. Sold units are computed from actual sales records.
        </p>
      </div>

      <GlassCard className="overflow-x-auto p-2">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Sold</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const product = products.get(row.product_id);
              const store = stores.get(row.store_id);
              const value = edits[row.id] ?? String(row.available_units);
              const status = stockStatus(row.available_units);
              const sold = soldMap.get(`${row.product_id}:${row.store_id}`) ?? 0;
              return (
                <tr key={row.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{product?.name ?? "—"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {product?.product_code ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {store?.name ?? "—"}
                    <span className="block text-xs text-muted-foreground">{store?.city ?? ""}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {[row.floor, row.section, row.rack].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={value}
                        inputMode="numeric"
                        onChange={(e) => setEdits((d) => ({ ...d, [row.id]: e.target.value }))}
                        className="h-8 w-20"
                      />
                      {edits[row.id] !== undefined ? (
                        <Button
                          size="sm"
                          disabled={saving === row.id}
                          onClick={() => void saveUnits(row.id, row.product_id, row.store_id)}
                        >
                          Save
                        </Button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{sold}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        status === "in_stock"
                          ? "text-success"
                          : status === "low_stock"
                            ? "text-warning"
                            : "text-muted-foreground"
                      }
                    >
                      {stockLabel[status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
