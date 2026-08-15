export type TryOnType = "upper_body" | "lower_body" | "full_body" | "accessory";

export interface Product {
  id: string;
  product_code: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  gender: string;
  price: number;
  colour: string;
  sizes: string[];
  fit: string | null;
  material: string | null;
  style: string | null;
  occasion: string | null;
  images: string[];
  try_on_type: TryOnType;
  is_new_arrival: boolean;
  is_trending: boolean;
  /** Present only on admin catalogue queries. */
  is_active?: boolean;
}

export interface InventoryRow {
  id: string;
  product_id: string;
  store_id: string;
  available_units: number;
  sold_units: number;
  section: string | null;
  floor: string | null;
  rack: string | null;
}

export interface StoreRow {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string | null;
}

export const TRY_ON_LABEL: Record<TryOnType, string> = {
  upper_body: "Upper body",
  lower_body: "Lower body",
  full_body: "Full body",
  accessory: "Accessory",
};
