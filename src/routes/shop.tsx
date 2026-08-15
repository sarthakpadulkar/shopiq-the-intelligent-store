import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ShopShell } from "@/components/shop-shell";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "ShopIQ In-Store Experience" },
      {
        name: "description",
        content: "AI-guided in-store shopping: search, style advice and virtual try-on.",
      },
      { property: "og:title", content: "ShopIQ In-Store Experience" },
      {
        property: "og:description",
        content: "AI-guided in-store shopping: search, style advice and virtual try-on.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ShopShell>
      <Outlet />
    </ShopShell>
  ),
});
