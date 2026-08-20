import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { runVirtualTryOn } from "@/lib/tryon.server";

const schema = z.object({
  personImage: z.string().startsWith("data:image/").max(9_000_000),
  garmentImageUrl: z.string().url(),
  garmentName: z.string().max(200),
  tryOnType: z.enum(["upper_body", "lower_body", "full_body", "accessory"]),
});

export const generateTryOn = createServerFn({ method: "POST" })
  .validator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    if (!checkRateLimit("generateTryOn", 5, 300_000)) {
      return { status: "unavailable" as const, reason: "rate_limited" };
    }
    return runVirtualTryOn(data);
  });
