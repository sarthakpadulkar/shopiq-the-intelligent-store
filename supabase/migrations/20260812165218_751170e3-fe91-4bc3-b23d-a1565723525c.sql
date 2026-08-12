
CREATE OR REPLACE VIEW public.v_product_performance
WITH (security_invoker = on) AS
SELECT
  p.id AS product_id,
  p.name,
  p.product_code,
  p.category,
  p.gender,
  p.colour,
  p.price,
  COALESCE(e.impressions,0) AS impressions,
  COALESCE(e.views,0) AS views,
  COALESCE(e.selections,0) AS selections,
  COALESCE(e.try_ons,0) AS try_ons,
  COALESCE(e.qr_scans,0) AS qr_scans,
  COALESCE(e.find_in_store,0) AS find_in_store,
  COALESCE(s.searches,0) AS searches,
  COALESCE(inv.available_units,0) AS available_units,
  COALESCE(sal.units_sold,0) AS units_sold,
  COALESCE(sal.revenue,0) AS revenue,
  CASE WHEN COALESCE(e.views,0) > 0
    THEN ROUND(100.0 * COALESCE(sal.units_sold,0) / e.views, 2) ELSE NULL END AS conversion_pct,
  CASE WHEN COALESCE(e.views,0) > 0
    THEN ROUND(100.0 * COALESCE(e.try_ons,0) / e.views, 2) ELSE NULL END AS view_to_tryon_pct,
  CASE WHEN COALESCE(e.try_ons,0) > 0
    THEN ROUND(100.0 * COALESCE(sal.units_sold,0) / e.try_ons, 2) ELSE NULL END AS tryon_to_sale_pct
FROM public.products p
LEFT JOIN (
  SELECT product_id,
    COUNT(*) FILTER (WHERE event_type='product_impression') AS impressions,
    COUNT(*) FILTER (WHERE event_type='product_viewed') AS views,
    COUNT(*) FILTER (WHERE event_type='product_selected') AS selections,
    COUNT(*) FILTER (WHERE event_type IN ('try_on_started','try_on_completed')) AS try_ons,
    COUNT(*) FILTER (WHERE event_type='qr_generated') AS qr_scans,
    COUNT(*) FILTER (WHERE event_type='find_in_store_clicked') AS find_in_store
  FROM public.analytics_events WHERE product_id IS NOT NULL GROUP BY product_id
) e ON e.product_id = p.id
LEFT JOIN (
  SELECT product_id, SUM(available_units) AS available_units
  FROM public.inventory GROUP BY product_id
) inv ON inv.product_id = p.id
LEFT JOIN (
  SELECT product_id, SUM(units) AS units_sold, SUM(total_value) AS revenue
  FROM public.sales GROUP BY product_id
) sal ON sal.product_id = p.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS searches FROM public.analytics_events ae
  WHERE ae.event_type = 'search_performed'
    AND ae.query IS NOT NULL
    AND lower(ae.query) LIKE '%' || lower(p.colour) || '%'
    AND lower(ae.query) LIKE '%' || lower(split_part(p.category,' ',1)) || '%'
) s ON true;

CREATE OR REPLACE VIEW public.v_search_analytics
WITH (security_invoker = on) AS
SELECT lower(query) AS query, COUNT(*) AS searches, MAX(created_at) AS last_searched
FROM public.analytics_events
WHERE event_type = 'search_performed' AND query IS NOT NULL AND length(query) > 1
GROUP BY lower(query);

CREATE OR REPLACE VIEW public.v_category_analytics
WITH (security_invoker = on) AS
SELECT category,
  SUM(views) AS views, SUM(searches) AS searches, SUM(try_ons) AS try_ons,
  SUM(selections) AS selections, SUM(units_sold) AS units_sold, SUM(revenue) AS revenue,
  SUM(available_units) AS available_units,
  CASE WHEN SUM(views) > 0 THEN ROUND(100.0 * SUM(units_sold)/SUM(views),2) ELSE NULL END AS conversion_pct
FROM public.v_product_performance GROUP BY category;

CREATE OR REPLACE VIEW public.v_store_analytics
WITH (security_invoker = on) AS
SELECT st.id AS store_id, st.name, st.city, st.code,
  COALESCE(se.sessions,0) AS sessions,
  COALESCE(ev.interactions,0) AS interactions,
  COALESCE(ev.searches,0) AS searches,
  COALESCE(ev.views,0) AS views,
  COALESCE(ev.try_ons,0) AS try_ons,
  COALESCE(ev.selections,0) AS selections,
  COALESCE(sa.units_sold,0) AS units_sold,
  COALESCE(sa.revenue,0) AS revenue,
  CASE WHEN COALESCE(ev.views,0) > 0
    THEN ROUND(100.0 * COALESCE(sa.units_sold,0)/ev.views,2) ELSE NULL END AS conversion_pct
FROM public.stores st
LEFT JOIN (SELECT store_id, COUNT(*) AS sessions FROM public.anonymous_sessions GROUP BY store_id) se
  ON se.store_id = st.id
LEFT JOIN (
  SELECT store_id, COUNT(*) AS interactions,
    COUNT(*) FILTER (WHERE event_type='search_performed') AS searches,
    COUNT(*) FILTER (WHERE event_type='product_viewed') AS views,
    COUNT(*) FILTER (WHERE event_type IN ('try_on_started','try_on_completed')) AS try_ons,
    COUNT(*) FILTER (WHERE event_type='product_selected') AS selections
  FROM public.analytics_events GROUP BY store_id
) ev ON ev.store_id = st.id
LEFT JOIN (SELECT store_id, SUM(units) AS units_sold, SUM(total_value) AS revenue FROM public.sales GROUP BY store_id) sa
  ON sa.store_id = st.id;

CREATE OR REPLACE VIEW public.v_demand_intelligence
WITH (security_invoker = on) AS
SELECT product_id, name, product_code, category, colour, searches, views, try_ons,
  available_units, units_sold,
  CASE
    WHEN searches >= 30 AND available_units <= 30 THEN 'high'
    WHEN searches >= 10 AND available_units <= 60 THEN 'medium'
    ELSE 'low' END AS demand_risk,
  GREATEST(searches - available_units, 0) AS unmet_signal
FROM public.v_product_performance;

CREATE OR REPLACE VIEW public.v_engagement_summary
WITH (security_invoker = on) AS
SELECT
  (SELECT COUNT(*) FROM public.anonymous_sessions) AS total_sessions,
  (SELECT COUNT(*) FROM public.analytics_events) AS total_interactions,
  (SELECT COUNT(*) FROM public.analytics_events WHERE event_type='search_performed') AS searches,
  (SELECT COUNT(*) FROM public.analytics_events WHERE event_type='product_viewed') AS product_views,
  (SELECT COUNT(*) FROM public.analytics_events WHERE event_type='product_selected') AS product_selections,
  (SELECT COUNT(*) FROM public.analytics_events WHERE event_type='ai_message_sent') AS ai_conversations,
  (SELECT COUNT(*) FROM public.analytics_events WHERE event_type IN ('try_on_started','try_on_completed')) AS try_ons,
  (SELECT COUNT(*) FROM public.analytics_events WHERE event_type='qr_generated') AS qr_scans,
  (SELECT COALESCE(SUM(units),0) FROM public.sales) AS units_sold,
  (SELECT COALESCE(SUM(total_value),0) FROM public.sales) AS revenue,
  (SELECT COUNT(*) FROM public.sales WHERE is_demo) AS demo_sales_rows;

GRANT SELECT ON public.v_product_performance TO authenticated;
GRANT SELECT ON public.v_search_analytics TO authenticated;
GRANT SELECT ON public.v_category_analytics TO authenticated;
GRANT SELECT ON public.v_store_analytics TO authenticated;
GRANT SELECT ON public.v_demand_intelligence TO authenticated;
GRANT SELECT ON public.v_engagement_summary TO authenticated;
