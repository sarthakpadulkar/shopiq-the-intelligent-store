import type { Tables } from "@/integrations/supabase/types";
import type { DashboardData } from "@/lib/analytics-queries";

type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  colour: string;
  price: number;
  views: number;
  try_ons: number;
  units_sold: number;
  available: number;
};

const products: Product[] = [
  { id: "33333333-0000-0000-0000-000000000001", code: "UE-TS-1001", name: "Black Oversized T-Shirt", category: "T-Shirt", colour: "Black", price: 1499, views: 4120, try_ons: 1186, units_sold: 624, available: 42 },
  { id: "33333333-0000-0000-0000-000000000002", code: "UE-TS-1002", name: "Oversized White T-Shirt", category: "T-Shirt", colour: "White", price: 1399, views: 5230, try_ons: 1492, units_sold: 731, available: 14 },
  { id: "33333333-0000-0000-0000-000000000003", code: "UE-SH-1003", name: "Black Formal Shirt", category: "Shirt", colour: "Black", price: 2499, views: 3410, try_ons: 821, units_sold: 389, available: 58 },
  { id: "33333333-0000-0000-0000-000000000004", code: "UE-SH-1004", name: "Classic White Shirt", category: "Shirt", colour: "White", price: 2299, views: 3880, try_ons: 903, units_sold: 426, available: 26 },
  { id: "33333333-0000-0000-0000-000000000005", code: "UE-JN-1005", name: "Straight Fit Blue Jeans", category: "Jeans", colour: "Blue", price: 3299, views: 2990, try_ons: 764, units_sold: 318, available: 22 },
  { id: "33333333-0000-0000-0000-000000000006", code: "UE-JN-1006", name: "Black Slim Jeans", category: "Jeans", colour: "Black", price: 3099, views: 2170, try_ons: 488, units_sold: 214, available: 47 },
  { id: "33333333-0000-0000-0000-000000000007", code: "UE-TR-1007", name: "Black Formal Trousers", category: "Trousers", colour: "Black", price: 2899, views: 2410, try_ons: 539, units_sold: 231, available: 39 },
  { id: "33333333-0000-0000-0000-000000000008", code: "UE-JK-1008", name: "Charcoal Bomber Jacket", category: "Jacket", colour: "Charcoal", price: 4999, views: 1580, try_ons: 367, units_sold: 122, available: 63 },
  { id: "33333333-0000-0000-0000-000000000009", code: "UE-OS-1009", name: "Olive Overshirt", category: "Overshirt", colour: "Olive", price: 3499, views: 1190, try_ons: 254, units_sold: 96, available: 71 },
  { id: "33333333-0000-0000-0000-000000000010", code: "UE-TS-1010", name: "Sand Relaxed T-Shirt", category: "T-Shirt", colour: "Sand", price: 1299, views: 1680, try_ons: 402, units_sold: 245, available: 55 },
  { id: "33333333-0000-0000-0000-000000000011", code: "UE-WT-2001", name: "Ribbed Knit Top", category: "Top", colour: "Ivory", price: 1799, views: 2760, try_ons: 812, units_sold: 347, available: 33 },
  { id: "33333333-0000-0000-0000-000000000012", code: "UE-WT-2002", name: "Black Satin Blouse", category: "Top", colour: "Black", price: 2599, views: 1990, try_ons: 556, units_sold: 178, available: 61 },
  { id: "33333333-0000-0000-0000-000000000013", code: "UE-WD-2003", name: "Emerald Midi Dress", category: "Dress", colour: "Emerald", price: 5499, views: 3170, try_ons: 1021, units_sold: 261, available: 9 },
  { id: "33333333-0000-0000-0000-000000000014", code: "UE-WD-2004", name: "Little Black Dress", category: "Dress", colour: "Black", price: 4799, views: 2890, try_ons: 844, units_sold: 193, available: 48 },
  { id: "33333333-0000-0000-0000-000000000015", code: "UE-WJ-2005", name: "High Rise Straight Jeans", category: "Jeans", colour: "Blue", price: 3399, views: 2320, try_ons: 617, units_sold: 186, available: 35 },
  { id: "33333333-0000-0000-0000-000000000016", code: "UE-WT-2006", name: "Wide Leg Trousers", category: "Trousers", colour: "Stone", price: 3199, views: 2050, try_ons: 488, units_sold: 152, available: 44 },
  { id: "33333333-0000-0000-0000-000000000017", code: "UE-WJ-2007", name: "Cropped Denim Jacket", category: "Jacket", colour: "Indigo", price: 4299, views: 1440, try_ons: 312, units_sold: 88, available: 66 },
  { id: "33333333-0000-0000-0000-000000000018", code: "UE-WS-2008", name: "Pleated Midi Skirt", category: "Skirt", colour: "Champagne", price: 2899, views: 1760, try_ons: 489, units_sold: 121, available: 52 },
  { id: "33333333-0000-0000-0000-000000000019", code: "UE-AC-3001", name: "White Leather Sneakers", category: "Sneakers", colour: "White", price: 4599, views: 3340, try_ons: 1043, units_sold: 297, available: 18 },
  { id: "33333333-0000-0000-0000-000000000020", code: "UE-AC-3002", name: "Tan Leather Belt", category: "Belt", colour: "Tan", price: 1899, views: 1320, try_ons: 367, units_sold: 193, available: 87 },
];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function pct(num: number, den: number) {
  return den > 0 ? round2((100 * num) / den) : null;
}

const productRows: Tables<"v_product_performance">[] = products.map((p) => ({
  product_id: p.id,
  name: p.name,
  product_code: p.code,
  category: p.category,
  gender: null,
  colour: p.colour,
  price: p.price,
  impressions: p.views + Math.round(p.views * 0.35),
  views: p.views,
  selections: Math.round(p.views * 0.21),
  try_ons: p.try_ons,
  qr_scans: Math.round(p.try_ons * 0.42),
  find_in_store: Math.round(p.views * 0.07),
  searches: Math.round(p.views * 0.16),
  available_units: p.available,
  units_sold: p.units_sold,
  revenue: round2(p.units_sold * p.price),
  conversion_pct: pct(p.units_sold, p.views),
  view_to_tryon_pct: pct(p.try_ons, p.views),
  tryon_to_sale_pct: pct(p.units_sold, p.try_ons),
}));

const categoryOrder = ["T-Shirt", "Jeans", "Dress", "Shirt", "Top", "Jacket", "Trousers", "Sneakers", "Overshirt", "Skirt", "Belt"];
const categories: Tables<"v_category_analytics">[] = categoryOrder.map((category) => {
  const rows = productRows.filter((r) => r.category === category);
  const views = rows.reduce((s, r) => s + (r.views ?? 0), 0);
  const try_ons = rows.reduce((s, r) => s + (r.try_ons ?? 0), 0);
  const selections = rows.reduce((s, r) => s + (r.selections ?? 0), 0);
  const units_sold = rows.reduce((s, r) => s + (r.units_sold ?? 0), 0);
  const revenue = round2(rows.reduce((s, r) => s + Number(r.revenue ?? 0), 0));
  const searches = rows.reduce((s, r) => s + (r.searches ?? 0), 0);
  const available_units = rows.reduce((s, r) => s + (r.available_units ?? 0), 0);
  return {
    category,
    views,
    searches,
    try_ons,
    selections,
    units_sold,
    revenue,
    available_units,
    conversion_pct: pct(units_sold, views),
  };
});

const storeRows: Tables<"v_store_analytics">[] = [
  { store_id: "22222222-0000-0000-0000-000000000001", name: "Pune Central", city: "Pune", code: "PUN-01", sessions: 682, interactions: 5090, searches: 1621, views: 6241, try_ons: 743, selections: 1284, units_sold: 912, revenue: 982400, conversion_pct: 14.61 },
  { store_id: "22222222-0000-0000-0000-000000000002", name: "Pune Koregaon Park", city: "Pune", code: "PUN-02", sessions: 518, interactions: 3745, searches: 1204, views: 4412, try_ons: 561, selections: 892, units_sold: 613, revenue: 669300, conversion_pct: 13.89 },
  { store_id: "22222222-0000-0000-0000-000000000003", name: "Mumbai Lower Parel", city: "Mumbai", code: "MUM-01", sessions: 801, interactions: 6120, searches: 1976, views: 7820, try_ons: 941, selections: 1618, units_sold: 1173, revenue: 1287400, conversion_pct: 15.0 },
  { store_id: "22222222-0000-0000-0000-000000000004", name: "Mumbai Andheri", city: "Mumbai", code: "MUM-02", sessions: 447, interactions: 3120, searches: 1003, views: 3744, try_ons: 429, selections: 740, units_sold: 514, revenue: 548900, conversion_pct: 13.73 },
  { store_id: "22222222-0000-0000-0000-000000000005", name: "Bengaluru Indiranagar", city: "Bengaluru", code: "BLR-01", sessions: 736, interactions: 5435, searches: 1752, views: 6830, try_ons: 833, selections: 1391, units_sold: 1008, revenue: 1102100, conversion_pct: 14.76 },
  { store_id: "22222222-0000-0000-0000-000000000006", name: "Bengaluru Whitefield", city: "Bengaluru", code: "BLR-02", sessions: 392, interactions: 2580, searches: 841, views: 3106, try_ons: 361, selections: 631, units_sold: 443, revenue: 473900, conversion_pct: 14.26 },
];

const searches: Tables<"v_search_analytics">[] = [
  { query: "oversized white t-shirt", searches: 1284, last_searched: "2026-08-15T09:12:00Z" },
  { query: "black oversized t-shirt", searches: 1042, last_searched: "2026-08-15T08:47:00Z" },
  { query: "straight fit jeans", searches: 916, last_searched: "2026-08-15T07:58:00Z" },
  { query: "white sneakers", searches: 873, last_searched: "2026-08-15T09:01:00Z" },
  { query: "outfit for a wedding", searches: 759, last_searched: "2026-08-14T20:34:00Z" },
  { query: "emerald dress", searches: 701, last_searched: "2026-08-15T06:22:00Z" },
  { query: "formal clothes under 5000", searches: 668, last_searched: "2026-08-14T18:11:00Z" },
  { query: "black formal shirt", searches: 642, last_searched: "2026-08-15T07:40:00Z" },
  { query: "wide leg trousers", searches: 590, last_searched: "2026-08-15T05:18:00Z" },
  { query: "denim jacket women", searches: 544, last_searched: "2026-08-14T19:02:00Z" },
  { query: "something casual for college", searches: 501, last_searched: "2026-08-15T04:55:00Z" },
  { query: "oversized white tee", searches: 462, last_searched: "2026-08-14T21:26:00Z" },
  { query: "ribbed knit top", searches: 411, last_searched: "2026-08-15T03:14:00Z" },
  { query: "linen shirt", searches: 388, last_searched: "2026-08-14T17:43:00Z" },
  { query: "pleated midi skirt", searches: 342, last_searched: "2026-08-15T02:07:00Z" },
  { query: "beige cargo pants", searches: 297, last_searched: "2026-08-14T16:52:00Z" },
  { query: "tan leather belt", searches: 251, last_searched: "2026-08-15T01:33:00Z" },
  { query: "black satin blouse", searches: 219, last_searched: "2026-08-14T15:21:00Z" },
  { query: "cropped denim jacket", searches: 187, last_searched: "2026-08-15T00:46:00Z" },
  { query: "olive overshirt", searches: 164, last_searched: "2026-08-14T14:09:00Z" },
];

const demand: Tables<"v_demand_intelligence">[] = productRows.map((r) => {
  const searches = r.searches ?? 0;
  const available = r.available_units ?? 0;
  const risk = searches >= 900 && available <= 25 ? "high" : searches >= 500 && available <= 55 ? "medium" : "low";
  return {
    product_id: r.product_id,
    name: r.name,
    product_code: r.product_code,
    category: r.category,
    colour: r.colour,
    searches,
    views: r.views,
    try_ons: r.try_ons,
    available_units: available,
    units_sold: r.units_sold,
    demand_risk: risk,
    unmet_signal: Math.max(searches - available, 0),
  };
});

export function fetchDemoDashboard(): Promise<DashboardData> {
  return Promise.resolve({
    summary: {
      total_sessions: storeRows.reduce((s, r) => s + (r.sessions ?? 0), 0),
      total_interactions: storeRows.reduce((s, r) => s + (r.interactions ?? 0), 0),
      searches: searches.reduce((s, q) => s + (q.searches ?? 0), 0),
      product_views: productRows.reduce((s, r) => s + (r.views ?? 0), 0),
      product_selections: productRows.reduce((s, r) => s + (r.selections ?? 0), 0),
      ai_conversations: 1683,
      try_ons: productRows.reduce((s, r) => s + (r.try_ons ?? 0), 0),
      qr_scans: productRows.reduce((s, r) => s + (r.qr_scans ?? 0), 0),
      units_sold: productRows.reduce((s, r) => s + (r.units_sold ?? 0), 0),
      revenue: round2(productRows.reduce((s, r) => s + Number(r.revenue ?? 0), 0)),
      demo_sales_rows: 631,
    },
    products: productRows,
    categories,
    stores: storeRows,
    searches,
    demand,
  });
}
