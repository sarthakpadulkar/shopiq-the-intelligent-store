import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ASSISTANT_SYSTEM,
  SEARCH_SYSTEM,
  askGateway,
  catalogueForPrompt,
  keywordMatch,
  loadCatalogue,
  parseJsonBlock,
  type SearchIntent,
} from "@/lib/ai.server";
import { checkRateLimit } from "@/lib/rate-limit";

const searchSchema = z.object({ query: z.string().min(1).max(400) });

export const aiSearch = createServerFn({ method: "POST" })
  .validator((input: unknown) => searchSchema.parse(input))
  .handler(async ({ data }) => {
    if (!checkRateLimit("aiSearch", 30, 60_000)) {
      return {
        mode: "offline" as const,
        intent: {} as SearchIntent,
        message: "Too many requests. Please wait a moment before searching again.",
        productIds: [] as string[],
        degraded: true,
      };
    }

    const catalogue = await loadCatalogue();
    const result = await askGateway(
      `${SEARCH_SYSTEM}\n\nCATALOGUE (id | name | category | gender | price | colour | fit | style | occasion | stock):\n${catalogueForPrompt(catalogue)}`,
      [{ role: "user", content: data.query }],
    );

    const parsed = result.ok
      ? parseJsonBlock<{ intent: SearchIntent; message: string; product_ids: string[] }>(
          result.content,
        )
      : null;

    const valid = new Set(catalogue.map((c) => c.id));
    const ids = (parsed?.product_ids ?? []).filter((id) => valid.has(id));

    if (ids.length === 0) {
      const fallback = keywordMatch(data.query, catalogue);
      return {
        mode: result.ok ? ("ai" as const) : ("offline" as const),
        intent: (parsed?.intent ?? {}) as SearchIntent,
        message:
          parsed?.message ??
          (fallback.length
            ? `Here is what we have in store for "${data.query}".`
            : `We couldn't find a match for "${data.query}" in this store right now.`),
        productIds: fallback.map((f) => f.id),
        degraded: !result.ok,
      };
    }

    return {
      mode: "ai" as const,
      intent: parsed?.intent ?? ({} as SearchIntent),
      message: parsed?.message ?? "Here is what we found in store.",
      productIds: ids,
      degraded: false,
    };
  });

const assistantSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(30),
});

export const assistantReply = createServerFn({ method: "POST" })
  .validator((input: unknown) => assistantSchema.parse(input))
  .handler(async ({ data }) => {
    if (!checkRateLimit("assistantReply", 15, 60_000)) {
      return {
        degraded: true,
        message: "Too many requests. Please wait a moment before chatting again.",
        productIds: [] as string[],
      };
    }

    const catalogue = await loadCatalogue();
    const result = await askGateway(
      `${ASSISTANT_SYSTEM}\n\nCATALOGUE (id | name | category | gender | price | colour | fit | style | occasion | stock):\n${catalogueForPrompt(catalogue)}`,
      data.messages,
    );

    if (!result.ok) {
      const last = data.messages[data.messages.length - 1]?.content ?? "";
      const fallback = keywordMatch(last, catalogue).slice(0, 6);
      return {
        degraded: true,
        message:
          "AI shopping is temporarily unavailable. You can keep browsing — here are close matches from this store.",
        productIds: fallback.map((f) => f.id),
      };
    }

    const parsed = parseJsonBlock<{ message: string; product_ids: string[] }>(result.content);
    const valid = new Set(catalogue.map((c) => c.id));
    return {
      degraded: false,
      message: parsed?.message ?? result.content.slice(0, 400),
      productIds: (parsed?.product_ids ?? []).filter((id) => valid.has(id)),
    };
  });

const lookSchema = z.object({ productId: z.string().uuid() });

export const completeTheLook = createServerFn({ method: "POST" })
  .validator((input: unknown) => lookSchema.parse(input))
  .handler(async ({ data }) => {
    const catalogue = await loadCatalogue();
    const base = catalogue.find((c) => c.id === data.productId);
    if (!base) return { productIds: [] as string[] };

    const wantsLower = base.try_on_type === "upper_body";
    const inStock = catalogue.filter((c) => c.id !== base.id && c.available_units > 0);

    const ranked = inStock
      .map((c) => {
        let score = 0;
        if (wantsLower && c.try_on_type === "lower_body") score += 4;
        if (!wantsLower && c.try_on_type === "upper_body") score += 4;
        if (c.try_on_type === "accessory") score += 3;
        if (base.try_on_type === "full_body" && c.try_on_type === "accessory") score += 2;
        if (c.gender === base.gender || c.gender === "unisex") score += 2;
        if (c.occasion && c.occasion === base.occasion) score += 2;
        if (c.style && c.style === base.style) score += 1;
        return { c, score };
      })
      .filter((r) => r.score > 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return { productIds: ranked.map((r) => r.c.id) };
  });
