import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { CameraCapture } from "@/components/camera-capture";
import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { hydrateTryOn, tryOnStore, useTryOn } from "@/lib/tryon-session";

export const Route = createFileRoute("/shop/try-on")({
  head: () => ({
    meta: [
      { title: "Virtual Try-On — ShopIQ" },
      { name: "description", content: "Take one photo in store and preview any garment on yourself instantly." },
      { property: "og:title", content: "Virtual Try-On — ShopIQ" },
      { property: "og:description", content: "Take one photo in store and preview any garment on yourself instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TryOnPage,
});

function TryOnPage() {
  const state = useTryOn();

  useEffect(() => {
    hydrateTryOn();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-4">
      <SectionLabel>Virtual try-on</SectionLabel>

      {!state.personImage ? (
        <CameraCapture
          onCapture={(dataUrl) => {
            tryOnStore.setPhoto(dataUrl);
            track("try_on_started");
          }}
        />
      ) : (
        <GlassCard className="overflow-hidden">
          <img
            src={state.personImage}
            alt="Your try-on photo"
            className="aspect-[3/4] w-full object-cover"
          />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-muted-foreground">
              Photo saved for this session. Pick garments from search and they'll be fitted onto this
              photo — no need to pose again.
            </p>
            <Button variant="glass" onClick={() => tryOnStore.end()}>
              Retake photo
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
