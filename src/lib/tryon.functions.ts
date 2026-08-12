import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runVirtualTryOn } from "@/lib/tryon.server";

const schema = z.object({
  personImage: z.string().startsWith("data:image/").max(9_000_000),
  garmentImageUrl: z.string().url(),
  garmentName: z.string().max(200),
  tryOnType: z.enum(["upper_body", "lower_body", "full_body", "accessory"]),
});

export const generateTryOn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => runVirtualTryOn(data));
