-- ============================================================
-- Trigger: sync sales → inventory
-- When a sale is inserted, decrement available_units and
-- increment sold_units on the matching inventory row.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_sale_stock_update()
RETURNS TRIGGER AS $$
DECLARE
  current_available integer;
BEGIN
  SELECT available_units INTO current_available
  FROM public.inventory
  WHERE product_id = NEW.product_id
    AND store_id = NEW.store_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.inventory (product_id, store_id, available_units, sold_units)
    VALUES (NEW.product_id, NEW.store_id, 0, NEW.units);
    RETURN NEW;
  END IF;

  IF current_available < NEW.units THEN
    RAISE EXCEPTION 'Insufficient stock for product % at store %: requested %, available %',
      NEW.product_id, NEW.store_id, NEW.units, current_available;
  END IF;

  UPDATE public.inventory
  SET
    available_units = available_units - NEW.units,
    sold_units = sold_units + NEW.units,
    updated_at = now()
  WHERE product_id = NEW.product_id
    AND store_id = NEW.store_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only fire for authenticated inserts (POS/ERP), not demo seed data
DROP TRIGGER IF EXISTS on_sale_insert ON public.sales;
CREATE TRIGGER on_sale_insert
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_update();

-- ============================================================
-- Fix stale sold_units from demo seed data
-- Recompute sold_units from the sales table so the inventory
-- column reflects actual sales records.
-- ============================================================

UPDATE public.inventory inv
SET sold_units = COALESCE(sales_agg.total_units, 0)
FROM (
  SELECT product_id, store_id, SUM(units) AS total_units
  FROM public.sales
  GROUP BY product_id, store_id
) sales_agg
WHERE inv.product_id = sales_agg.product_id
  AND inv.store_id = sales_agg.store_id;

-- For inventory rows with no matching sales, set sold_units to 0
UPDATE public.inventory
SET sold_units = 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.sales s
  WHERE s.product_id = inventory.product_id
    AND s.store_id = inventory.store_id
);
