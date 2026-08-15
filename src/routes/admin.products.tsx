import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, PackagePlus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { inr, stockLabel, stockStatus } from "@/lib/format";
import { adminCatalogueQuery } from "@/lib/queries";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — ShopIQ Admin" },
      { name: "description", content: "Manage the live product catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

const CATEGORIES = ["Men", "Women", "Unisex", "Footwear", "Accessories"];
const TRY_ON_TYPES = ["upper_body", "lower_body", "full_body", "accessory"] as const;

function ProductsPage() {
  const { data, isLoading } = useQuery(adminCatalogueQuery);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const products = useMemo(() => {
    const list = data?.products ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      `${p.name} ${p.product_code} ${p.category} ${p.colour}`.toLowerCase().includes(q),
    );
  }, [data, filter]);

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data?.inventory ?? []) {
      map.set(row.product_id, (map.get(row.product_id) ?? 0) + row.available_units);
    }
    return map;
  }, [data]);

  async function savePrice(p: Product) {
    const value = Number(price);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    setSaving(p.id);
    const { error } = await supabase.from("products").update({ price: value }).eq("id", p.id);
    setSaving(null);
    if (error) {
      toast.error("Update blocked by your role. Admins can change prices.");
      return;
    }
    audit("product.price_update", "products", p.id, { price: value });
    setEditing(null);
    toast.success("Price updated.");
    await queryClient.invalidateQueries({ queryKey: ["admin-catalogue"] });
  }

  async function toggleActive(p: Product, active: boolean) {
    const { error } = await supabase.from("products").update({ is_active: active }).eq("id", p.id);
    if (error) {
      toast.error("Update blocked by your role. Admins can activate or hide products.");
      return;
    }
    audit("product.toggle_active", "products", p.id, { is_active: active });
    toast.success(active ? "Product is now live." : "Product hidden from the store.");
    await queryClient.invalidateQueries({ queryKey: ["admin-catalogue"] });
  }

  if (isLoading) {
    return <div className="h-[60vh] animate-pulse rounded-3xl bg-secondary/40" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <SectionLabel>Products</SectionLabel>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Live catalogue
          </h1>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter products…"
              className="h-10 w-56 pl-9"
            />
          </div>
          <Button variant="hero" onClick={() => setAdding(true)}>
            <PackagePlus /> Add product
          </Button>
        </div>
      </div>

      <GlassCard className="overflow-x-auto p-2">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Try-on</th>
              <th className="px-4 py-3">Live</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = stockByProduct.get(p.id) ?? 0;
              const status = stockStatus(stock);
              return (
                <tr key={p.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="size-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.product_code} · {p.colour}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {p.category}
                    <span className="block text-xs text-muted-foreground">{p.gender}</span>
                  </td>
                  <td className="px-4 py-3">
                    {editing?.id === p.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          defaultValue={String(p.price)}
                          onChange={(e) => setPrice(e.target.value)}
                          className="h-8 w-28"
                          inputMode="decimal"
                        />
                        <Button
                          size="sm"
                          disabled={saving === p.id}
                          onClick={() => void savePrice(p)}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="rounded-md px-1 font-medium text-lux hover:underline"
                        onClick={() => {
                          setEditing(p);
                          setPrice(String(p.price));
                        }}
                        title="Click to edit price"
                      >
                        {inr(p.price)}
                      </button>
                    )}
                  </td>
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
                      {stockLabel[status]} ({stock})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.try_on_type}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={Boolean(p.is_active)}
                      onCheckedChange={(checked) => void toggleActive(p, checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>

      <Dialog open={adding} onOpenChange={setAdding}>
        <AddProductDialog
          onClose={() => setAdding(false)}
          stores={data?.stores ?? []}
          brands={data?.brands ?? []}
        />
      </Dialog>
    </div>
  );
}

function AddProductDialog({
  onClose,
  stores,
  brands,
}: {
  onClose: () => void;
  stores: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    product_code: "",
    category: "Men",
    gender: "Men",
    price: "",
    colour: "Black",
    try_on_type: "upper_body" as (typeof TRY_ON_TYPES)[number],
  });
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!form.name.trim() || !form.product_code.trim() || !Number(form.price)) {
      toast.error("Name, code and price are required.");
      return;
    }
    setSaving(true);
    const brandId = brands[0]?.id;
    if (!brandId) {
      setSaving(false);
      toast.error("No demo brand configured.");
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .insert({
        brand_id: brandId,
        name: form.name.trim(),
        product_code: form.product_code.trim(),
        category: form.category,
        gender: form.gender,
        price: Number(form.price),
        colour: form.colour,
        try_on_type: form.try_on_type,
        sizes: ["S", "M", "L"],
        is_demo: true,
      })
      .select("id")
      .single();
    if (error || !data) {
      setSaving(false);
      toast.error("Could not create product — this requires an admin role.");
      return;
    }
    if (storeId) {
      await supabase
        .from("inventory")
        .insert({ product_id: data.id, store_id: storeId, available_units: 10, sold_units: 0 });
    }
    setSaving(false);
    audit("product.create", "products", data.id, {
      name: form.name,
      product_code: form.product_code,
    });
    toast.success("Product created.");
    onClose();
    await queryClient.invalidateQueries({ queryKey: ["admin-catalogue"] });
  }

  return (
    <DialogContent className="glass-strong max-w-lg rounded-3xl border-border">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">Add product</DialogTitle>
        <DialogDescription>
          New products appear across every store screen immediately.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4">
        <LabelField label="Name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Relaxed linen shirt"
          />
        </LabelField>
        <LabelField label="Product code">
          <Input
            value={form.product_code}
            onChange={(e) => setForm({ ...form, product_code: e.target.value })}
            placeholder="UE-SHT-0042"
          />
        </LabelField>
        <LabelField label="Price (₹)">
          <Input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            inputMode="decimal"
            placeholder="1999"
          />
        </LabelField>
        <LabelField label="Colour">
          <Input
            value={form.colour}
            onChange={(e) => setForm({ ...form, colour: e.target.value })}
            placeholder="Black"
          />
        </LabelField>
        <LabelField label="Category">
          <NativeSelect
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={CATEGORIES}
          />
        </LabelField>
        <LabelField label="Try-on type">
          <NativeSelect
            value={form.try_on_type}
            onChange={(e) =>
              setForm({ ...form, try_on_type: e.target.value as (typeof TRY_ON_TYPES)[number] })
            }
            options={TRY_ON_TYPES.map((t) => t)}
          />
        </LabelField>
        <LabelField label="Initial store (10 units)">
          <NativeSelect
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            options={stores.map((s) => s.id)}
            labels={stores.map((s) => s.name)}
          />
        </LabelField>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="hero" disabled={saving} onClick={() => void create()}>
          <Boxes /> Create
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function LabelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  labels,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  labels?: string[];
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {options.map((o, i) => (
        <option key={o} value={o} className="bg-popover">
          {labels?.[i] ?? o}
        </option>
      ))}
    </select>
  );
}
