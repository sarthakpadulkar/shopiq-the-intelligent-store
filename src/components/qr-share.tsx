import QRCode from "qrcode";
import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { track } from "@/lib/analytics";

export function QrShare({
  path,
  productId,
  label = "Share via QR",
  title = "Scan to continue on your phone",
}: {
  path: string;
  productId?: string;
  label?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    const absolute = `${window.location.origin}${path}`;
    setUrl(absolute);
    void QRCode.toDataURL(absolute, {
      width: 520,
      margin: 1,
      color: { dark: "#0c1116", light: "#ffffff" },
    }).then(setDataUrl);
    track("qr_generated", { productId: productId ?? null, metadata: { path } });
  }, [open, path, productId]);

  return (
    <>
      <Button variant="glass" onClick={() => setOpen(true)}>
        <QrCode /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong max-w-md rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 pb-2">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR code"
                width={260}
                height={260}
                className="rounded-2xl bg-background p-3"
              />
            ) : (
              <div className="size-[260px] animate-pulse rounded-2xl bg-secondary/50" />
            )}
            <p className="break-all text-center text-xs text-muted-foreground">{url}</p>
            <p className="text-center text-xs text-muted-foreground">
              No login required — the link opens a mobile-friendly ShopIQ page.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
