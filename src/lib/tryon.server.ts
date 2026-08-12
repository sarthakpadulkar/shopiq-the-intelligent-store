const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const IMAGE_MODEL = "google/gemini-3.1-flash-image";

export interface TryOnRequest {
  personImage: string; // data URL captured from the in-store camera
  garmentImageUrl: string; // absolute URL of the garment shot
  garmentName: string;
  tryOnType: string;
}

export interface TryOnResult {
  status: "ready" | "unavailable";
  image?: string;
  reason?: string;
}

const PLACEMENT: Record<string, string> = {
  upper_body: "Replace only the upper-body garment. Keep trousers, shoes and background unchanged.",
  lower_body: "Replace only the lower-body garment. Keep the top, shoes and background unchanged.",
  full_body: "Replace the full outfit with this one-piece garment. Keep shoes and background.",
  accessory: "Add this accessory naturally to the person. Keep the rest of the outfit unchanged.",
};

/**
 * Virtual try-on provider abstraction. Today it is backed by the Lovable AI
 * image model; swapping in a specialist try-on vendor only means replacing the
 * body of this function.
 */
export async function runVirtualTryOn(req: TryOnRequest): Promise<TryOnResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { status: "unavailable", reason: "not_configured" };

  const instruction = PLACEMENT[req.tryOnType] ?? PLACEMENT["upper_body"];

  try {
    const response = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Virtual try-on. The first image is the shopper. The second image is the garment "${req.garmentName}". ${instruction} Preserve the shopper's face, body proportions, pose, lighting and background exactly. Photorealistic result.`,
              },
              { type: "image_url", image_url: { url: req.personImage } },
              { type: "image_url", image_url: { url: req.garmentImageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        status: "unavailable",
        reason: response.status === 429 ? "rate_limited" : "provider_error",
      };
    }

    const json = (await response.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const image = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!image) return { status: "unavailable", reason: "no_image" };
    return { status: "ready", image };
  } catch {
    return { status: "unavailable", reason: "network" };
  }
}
