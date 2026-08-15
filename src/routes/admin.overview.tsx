import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsOverview } from "@/components/admin/analytics-overview";

export const Route = createFileRoute("/admin/overview")({
  head: () => ({
    meta: [
      { title: "Admin Overview — ShopIQ" },
      { name: "description", content: "Live retail intelligence across every store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AnalyticsOverview />,
});
