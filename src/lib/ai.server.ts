import { publicDb } from "@/lib/db.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

export interface CatalogueItem {
  id: string;
  product_code: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  colour: string;
  fit: string | null;
  style: string | null;
  occasion: string | null;
  sizes: string[];
  try_on_type: string;
  available_units: number;
}

/** The AI may only ever choose from these rows — it can never invent a product. */
export async function loadCatalogue(): Promise<CatalogueItem[]> {
  const db = publicDb();
  const [{ data: products }, { data: inventory }] = await Promise.all([
    db
      .from("products")
      .select(
        "id, product_code, name, category, gender, price, colour, fit, style, occasion, sizes, try_on_type",
      )
      .eq("is_active", true),
    db.from("inventory").select("product_id, available_units"),
  ]);

  const stock = new Map<string, number>();
  for (const row of inventory ?? []) {
    stock.set(row.product_id, (stock.get(row.product_id) ?? 0) + (row.available_units ?? 0));
  }

  return (products ?? []).map((p) => ({
    ...p,
    price: Number(p.price),
    sizes: p.sizes ?? [],
    available_units: stock.get(p.id) ?? 0,
  }));
}

export function catalogueForPrompt(items: CatalogueItem[]): string {
  return items
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${p.category} | ${p.gender} | ₹${p.price} | ${p.colour} | fit:${p.fit ?? "-"} | style:${p.style ?? "-"} | occasion:${p.occasion ?? "-"} | stock:${p.available_units}`,
    )
    .join("\n");
}

interface GatewayResult {
  ok: boolean;
  content: string;
  status?: number;
}

export async function askGateway(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<GatewayResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, content: "" };

  try {
    const response = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!response.ok) return { ok: false, content: "", status: response.status };
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return { ok: true, content: json.choices?.[0]?.message?.content ?? "" };
  } catch {
    return { ok: false, content: "" };
  }
}

export function parseJsonBlock<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/** Deterministic keyword retrieval used when the AI gateway is unavailable. */
export function keywordMatch(query: string, items: CatalogueItem[]): CatalogueItem[] {
  const q = query.toLowerCase();
  const budget = q.match(/(?:under|below|less than)\s*₹?\s*(\d{3,6})/);
  const max = budget ? Number(budget[1]) : null;
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 2);

  const scored = items.map((item) => {
    const hay =
      `${item.name} ${item.category} ${item.colour} ${item.fit ?? ""} ${item.style ?? ""} ${item.occasion ?? ""} ${item.gender}`.toLowerCase();
    let score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    if (max && item.price <= max) score += 1;
    if (max && item.price > max) score -= 3;
    if (item.available_units <= 0) score -= 2;
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.item);
}

export interface SearchIntent {
  category?: string;
  colour?: string;
  fit?: string;
  gender?: string;
  occasion?: string;
  budget?: number;
}

export const SEARCH_SYSTEM = `You are ShopIQ, an in-store AI shopping assistant for a fashion retailer.
You are given the ONLY products that exist in this store's catalogue, with live stock counts.
Rules:
- NEVER invent, rename or hallucinate a product. Only reference the given product ids.
- Prefer products with stock > 0. Never present an out-of-stock product as available.
- Extract the shopper's intent (category, colour, fit, gender, occasion, budget in INR).
Reply with STRICT JSON only, no prose:
{"intent":{"category":"","colour":"","fit":"","gender":"","occasion":"","budget":0},
 "message":"one short friendly sentence for a shop screen",
 "product_ids":["..."]}
Return at most 12 product_ids ranked best-first.`;

export const ASSISTANT_SYSTEM = `You are ShopIQ, a warm, concise in-store AI stylist for a fashion store.
You may only recommend products from the catalogue provided, by id. Never invent products.
Never present an out-of-stock product as available. Keep answers under 60 words, friendly, no markdown headings.
Reply with STRICT JSON only:
{"message":"your reply","product_ids":["..."]}
Include up to 6 product_ids that you are visually referring to (may be empty).`;
