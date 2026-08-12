import { Camera, CameraOff, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass";

/**
 * Camera-only capture. There is deliberately no gallery, file input or
 * drag-and-drop: the shopper takes exactly one photo on the in-store screen.
 */
export function CameraCapture({ onCapture }: { onCapture: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"starting" | "live" | "denied" | "unsupported">("starting");
  const [facing, setFacing] = useState<"user" | "environment">("user");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (mode: "user" | "environment") => {
      stop();
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("unsupported");
        return;
      }
      try {
        setState("starting");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1080 }, height: { ideal: 1440 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState("live");
      } catch {
        setState("denied");
      }
    },
    [stop],
  );

  useEffect(() => {
    void start(facing);
    return stop;
  }, [facing, start, stop]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const w = video.videoWidth || 1080;
    const h = video.videoHeight || 1440;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    stop();
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="relative aspect-[3/4] w-full bg-secondary/40">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`size-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
        />
        {state !== "live" ? (
          <div className="absolute inset-0 grid place-items-center bg-background/80 p-8 text-center">
            {state === "starting" ? (
              <div>
                <div className="mx-auto size-14 animate-pulse-ring rounded-full bg-primary/20" />
                <p className="mt-6 text-sm text-muted-foreground">Opening camera…</p>
              </div>
            ) : (
              <div className="max-w-sm">
                <CameraOff className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-4 font-display text-lg font-semibold">
                  Camera access is required for Virtual Try-On.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Allow camera access on this screen, then try again.
                </p>
                <Button className="mt-5" variant="hero" onClick={() => void start(facing)}>
                  <RefreshCcw /> Try again
                </Button>
              </div>
            )}
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-6 rounded-3xl border border-primary/30" />
      </div>

      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <p className="flex-1 text-xs text-muted-foreground">
          Stand back so your full body is in frame. Your photo is used only for this try-on session.
        </p>
        <div className="flex gap-2">
          <Button
            variant="glass"
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
          >
            <RefreshCcw /> Flip
          </Button>
          <Button variant="hero" size="lg" disabled={state !== "live"} onClick={capture}>
            <Camera /> Take photo
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
