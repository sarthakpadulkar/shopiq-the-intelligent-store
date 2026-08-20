import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, PackagePlus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GlassCard, SectionLabel } from "@/components/glass";
import { ImageUpload } from "@/components/image-upload";
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
import { uploadProductImage } from "@/lib/upload";

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
const GENDERS = ["Men", "Women", "Unisex"];

function ProductsPage() {
  const { data, isLoading } = useQuery(adminCatalogueQuery);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

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

  async function deleteProduct(p: Product) {
    setSaving(p.id);
    await supabase.from("sales").delete().eq("product_id", p.id);
    await supabase.from("inventory").delete().eq("product_id", p.id);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    setSaving(null);
    if (error) {
      toast.error("Delete blocked by your role. Admins can delete products.");
      return;
    }
    audit("product.delete", "products", p.id, { name: p.name });
    toast.success("Product deleted.");
    setDeleting(null);
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
              <th className="px-4 py-3" />
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
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(p)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="glass-strong max-w-md rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Delete product</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>{deleting?.name}</strong> from the catalogue. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={saving === deleting?.id}
              onClick={() => deleting && void deleteProduct(deleting)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
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
    description: "",
    category: "Men",
    gender: "Men",
    price: "",
    colour: "Black",
    fit: "",
    material: "",
    style: "",
    occasion: "",
    try_on_type: "upper_body" as (typeof TRY_ON_TYPES)[number],
    sizes: "S, M, L",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    const sizes = form.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sizes.length === 0) sizes.push("S", "M", "L");

    const { data, error } = await supabase
      .from("products")
      .insert({
        brand_id: brandId,
        name: form.name.trim(),
        product_code: form.product_code.trim(),
        description: form.description.trim() || null,
        category: form.category,
        gender: form.gender,
        price: Number(form.price),
        colour: form.colour,
        fit: form.fit.trim() || null,
        material: form.material.trim() || null,
        style: form.style.trim() || null,
        occasion: form.occasion.trim() || null,
        try_on_type: form.try_on_type,
        sizes,
        is_demo: true,
      })
      .select("id")
      .single();
    if (error || !data) {
      setSaving(false);
      toast.error("Could not create product — this requires an admin role.");
      return;
    }
    if (imageFile) {
      const { url, error: uploadErr } = await uploadProductImage(
        imageFile,
        form.product_code.trim(),
      );
      if (uploadErr) {
        toast.error(`Image upload failed: ${uploadErr}`);
      } else if (url) {
        await supabase.from("products").update({ images: [url] }).eq("id", data.id);
      }
    }
    const inventoryRows = stores.map((s) => ({
      product_id: data.id,
      store_id: s.id,
      available_units: 10,
      sold_units: 0,
    }));
    const { error: invErr } = await supabase.from("inventory").upsert(inventoryRows, {
      onConflict: "product_id,store_id",
      ignoreDuplicates: true,
    });
    if (invErr) {
      toast.warning("Product created but some store inventory could not be seeded.");
    }
    setSaving(false);
    audit("product.create", "products", data.id, {
      name: form.name,
      product_code: form.product_code,
    });
    toast.success("Product created across all stores.");
    onClose();
    await queryClient.invalidateQueries({ queryKey: ["admin-catalogue"] });
  }

  return (
    <DialogContent className="glass-strong max-w-lg rounded-3xl border-border max-h-[85vh] overflow-y-auto">
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
        <LabelField label="Gender">
          <NativeSelect
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            options={GENDERS}
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
        <LabelField label="Sizes (comma-separated)">
          <Input
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            placeholder="S, M, L, XL"
          />
        </LabelField>
      </div>
      <LabelField label="Description">
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional product description"
        />
      </LabelField>
      <div className="grid grid-cols-2 gap-4">
        <LabelField label="Fit">
          <Input
            value={form.fit}
            onChange={(e) => setForm({ ...form, fit: e.target.value })}
            placeholder="e.g. Slim, Oversized"
          />
        </LabelField>
        <LabelField label="Material">
          <Input
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            placeholder="e.g. Cotton, Denim"
          />
        </LabelField>
        <LabelField label="Style">
          <Input
            value={form.style}
            onChange={(e) => setForm({ ...form, style: e.target.value })}
            placeholder="e.g. Casual, Formal"
          />
        </LabelField>
        <LabelField label="Occasion">
          <Input
            value={form.occasion}
            onChange={(e) => setForm({ ...form, occasion: e.target.value })}
            placeholder="e.g. Wedding, College"
          />
        </LabelField>
      </div>
      <LabelField label="Product image">
        <ImageUpload value={imageFile} onChange={setImageFile} disabled={saving} />
      </LabelField>
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
