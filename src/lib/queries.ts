import { supabase } from "@/integrations/supabase/client";
import type { InventoryRow, Product, StoreRow } from "@/lib/types";

const PRODUCT_COLS =
  "id, product_code, name, description, category, subcategory, gender, price, colour, sizes, fit, material, style, occasion, images, try_on_type, is_new_arrival, is_trending";

function normalise(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    price: Number(row["price"]),
    sizes: (row["sizes"] as string[]) ?? [],
    images: (row["images"] as string[]) ?? [],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalise);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalise(data) : null;
}

export async function fetchInventory(): Promise<InventoryRow[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("id, product_id, store_id, available_units, sold_units, section, floor, rack");
  if (error) throw error;
  return (data ?? []) as InventoryRow[];
}

export async function fetchStores(): Promise<StoreRow[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, code, city, address")
    .order("city");
  if (error) throw error;
  return (data ?? []) as StoreRow[];
}

export interface CatalogueBundle {
  products: Product[];
  inventory: InventoryRow[];
  stores: StoreRow[];
  stockByProduct: Record<string, number>;
}

export async function fetchCatalogue(): Promise<CatalogueBundle> {
  const [products, inventory, stores] = await Promise.all([
    fetchProducts(),
    fetchInventory(),
    fetchStores(),
  ]);
  const stockByProduct: Record<string, number> = {};
  for (const row of inventory) {
    stockByProduct[row.product_id] =
      (stockByProduct[row.product_id] ?? 0) + (row.available_units ?? 0);
  }
  return { products, inventory, stores, stockByProduct };
}

export const catalogueQuery = {
  queryKey: ["catalogue"],
  queryFn: fetchCatalogue,
  staleTime: 60_000,
};

export interface AdminCatalogue {
  products: Product[];
  inventory: InventoryRow[];
  stores: StoreRow[];
  brands: { id: string; name: string }[];
}

export async function fetchAdminCatalogue(): Promise<AdminCatalogue> {
  const [products, inventory, stores, brands] = await Promise.all([
    supabase
      .from("products")
      .select(`${PRODUCT_COLS}, is_active`)
      .order("created_at", { ascending: true }),
    fetchInventory(),
    fetchStores(),
    supabase.from("brands").select("id, name"),
  ]);
  if (products.error) throw products.error;
  return {
    products: (products.data ?? []).map(normalise),
    inventory,
    stores,
    brands: (brands.data ?? []) as { id: string; name: string }[],
  };
}

export const adminCatalogueQuery = {
  queryKey: ["admin-catalogue"],
  queryFn: fetchAdminCatalogue,
  staleTime: 30_000,
};
