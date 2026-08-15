import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { fetchDemoDashboard } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/demo-mode";

export type EngagementSummary = Tables<"v_engagement_summary">;
export type ProductPerformance = Tables<"v_product_performance">;
export type CategoryAnalytics = Tables<"v_category_analytics">;
export type StoreAnalytics = Tables<"v_store_analytics">;
export type SearchAnalytics = Tables<"v_search_analytics">;
export type DemandIntelligence = Tables<"v_demand_intelligence">;

export interface DashboardData {
  summary: EngagementSummary | null;
  products: ProductPerformance[];
  categories: CategoryAnalytics[];
  stores: StoreAnalytics[];
  searches: SearchAnalytics[];
  demand: DemandIntelligence[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  if (isDemoMode()) return fetchDemoDashboard();
  const [summary, products, categories, stores, searches, demand] = await Promise.all([
    supabase.from("v_engagement_summary").select("*").maybeSingle(),
    supabase.from("v_product_performance").select("*").order("revenue", { ascending: false }),
    supabase.from("v_category_analytics").select("*").order("revenue", { ascending: false }),
    supabase.from("v_store_analytics").select("*").order("revenue", { ascending: false }),
    supabase
      .from("v_search_analytics")
      .select("*")
      .order("searches", { ascending: false })
      .limit(20),
    supabase.from("v_demand_intelligence").select("*").order("unmet_signal", { ascending: false }),
  ]);

  const err =
    summary.error ??
    products.error ??
    categories.error ??
    stores.error ??
    searches.error ??
    demand.error;
  if (err) throw err;

  return {
    summary: summary.data ?? null,
    products: products.data ?? [],
    categories: categories.data ?? [],
    stores: stores.data ?? [],
    searches: searches.data ?? [],
    demand: demand.data ?? [],
  };
}

export const dashboardQuery = {
  queryKey: ["dashboard"],
  queryFn: fetchDashboard,
  staleTime: 30_000,
};
