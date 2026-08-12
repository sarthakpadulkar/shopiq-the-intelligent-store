
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('super_admin','brand_admin','store_manager','staff');

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  city text NOT NULL,
  address text,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_manage(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','brand_admin','store_manager'))
$$;

CREATE POLICY "roles readable by self" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles self write" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "brands public read" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "brands manage" ON public.brands FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));
CREATE POLICY "stores public read" ON public.stores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "stores manage" ON public.stores FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

-- ============ CATALOGUE ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  product_code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  subcategory text,
  gender text NOT NULL DEFAULT 'unisex',
  price numeric(10,2) NOT NULL,
  colour text NOT NULL,
  sizes text[] NOT NULL DEFAULT '{}',
  fit text,
  material text,
  style text,
  occasion text,
  images text[] NOT NULL DEFAULT '{}',
  try_on_type text NOT NULL DEFAULT 'upper_body',
  is_new_arrival boolean NOT NULL DEFAULT false,
  is_trending boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "products manage" ON public.products FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_gender_idx ON public.products(gender);

CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  available_units integer NOT NULL DEFAULT 0,
  sold_units integer NOT NULL DEFAULT 0,
  section text,
  floor text,
  rack text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, store_id)
);
GRANT SELECT ON public.inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory public read" ON public.inventory FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "inventory manage" ON public.inventory FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));
CREATE INDEX inventory_store_idx ON public.inventory(store_id);

-- ============ ANONYMOUS SESSIONS + EVENTS ============
CREATE TABLE public.anonymous_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text NOT NULL UNIQUE,
  store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE ON public.anonymous_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.anonymous_sessions TO authenticated;
GRANT ALL ON public.anonymous_sessions TO service_role;
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions insert anyone" ON public.anonymous_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sessions update anyone" ON public.anonymous_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sessions staff read" ON public.anonymous_sessions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE,
  store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  query text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events insert anyone" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "events staff read" ON public.analytics_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX events_type_idx ON public.analytics_events(event_type);
CREATE INDEX events_product_idx ON public.analytics_events(product_id);
CREATE INDEX events_created_idx ON public.analytics_events(created_at DESC);

CREATE TABLE public.ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.ai_interactions TO anon;
GRANT SELECT, INSERT ON public.ai_interactions TO authenticated;
GRANT ALL ON public.ai_interactions TO service_role;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai insert anyone" ON public.ai_interactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ai staff read" ON public.ai_interactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.try_on_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE,
  garment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.try_on_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.try_on_sessions TO authenticated;
GRANT ALL ON public.try_on_sessions TO service_role;
ALTER TABLE public.try_on_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tryon insert anyone" ON public.try_on_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tryon update anyone" ON public.try_on_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tryon staff read" ON public.try_on_sessions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ============ SALES (POS/ERP ONLY) ============
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  units integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_value numeric(12,2) NOT NULL,
  source text NOT NULL DEFAULT 'pos',
  is_demo boolean NOT NULL DEFAULT false,
  sold_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales staff read" ON public.sales FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "sales manage insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.can_manage(auth.uid()));
CREATE INDEX sales_product_idx ON public.sales(product_id);

CREATE TABLE public.pos_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'not_connected',
  last_sync_at timestamptz,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_integrations TO authenticated;
GRANT ALL ON public.pos_integrations TO service_role;
ALTER TABLE public.pos_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pos staff read" ON public.pos_integrations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "pos manage" ON public.pos_integrations FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit staff read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- profile auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'brand_admin')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ DEMO DATA ============
INSERT INTO public.brands (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111','UrbanEdge','urbanedge');

INSERT INTO public.stores (id, brand_id, name, code, city, address) VALUES
  ('22222222-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Pune Central','PUN-01','Pune','Bund Garden Road, Pune'),
  ('22222222-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Pune Koregaon Park','PUN-02','Pune','North Main Road, Pune'),
  ('22222222-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Mumbai Lower Parel','MUM-01','Mumbai','Phoenix Mills, Mumbai'),
  ('22222222-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Mumbai Andheri','MUM-02','Mumbai','Andheri West, Mumbai'),
  ('22222222-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Bengaluru Indiranagar','BLR-01','Bengaluru','100 Feet Road, Bengaluru'),
  ('22222222-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','Bengaluru Whitefield','BLR-02','Bengaluru','Whitefield Main Road, Bengaluru');

INSERT INTO public.pos_integrations (brand_id, provider, status, config) VALUES
  ('11111111-1111-1111-1111-111111111111','Generic POS Adapter','demo','{"note":"Demo POS feed. Connect a real POS/ERP to replace demo sales."}'::jsonb);

INSERT INTO public.products (id, brand_id, product_code, name, description, category, subcategory, gender, price, colour, sizes, fit, material, style, occasion, images, try_on_type, is_new_arrival, is_trending) VALUES
('33333333-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','UE-TS-1001','Black Oversized T-Shirt','Heavyweight cotton oversized tee with a dropped shoulder and clean finish.','T-Shirt','Upper Wear','male',1499,'Black','{S,M,L,XL,XXL}','Oversized','240 GSM Cotton','Streetwear','Casual','{/products/black-oversized-tshirt.jpg}','upper_body',true,true),
('33333333-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','UE-TS-1002','Oversized White T-Shirt','Crisp white oversized tee, garment dyed for a soft handfeel.','T-Shirt','Upper Wear','unisex',1399,'White','{S,M,L,XL}','Oversized','230 GSM Cotton','Minimal','Casual','{/products/white-oversized-tshirt.jpg}','upper_body',true,true),
('33333333-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','UE-SH-1003','Black Formal Shirt','Slim fit formal shirt in wrinkle-resistant twill.','Shirt','Upper Wear','male',2499,'Black','{S,M,L,XL}','Slim','Cotton Twill','Formal','Office','{/products/black-formal-shirt.jpg}','upper_body',false,true),
('33333333-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','UE-SH-1004','Classic White Shirt','Everyday white shirt with mother-of-pearl buttons.','Shirt','Upper Wear','male',2299,'White','{S,M,L,XL,XXL}','Regular','Poplin Cotton','Formal','Office','{/products/white-shirt.jpg}','upper_body',false,true),
('33333333-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','UE-JN-1005','Straight Fit Blue Jeans','Rigid denim in a clean straight leg with mid rise.','Jeans','Lower Wear','male',3299,'Blue','{28,30,32,34,36}','Straight','13oz Denim','Casual','Everyday','{/products/blue-straight-jeans.jpg}','lower_body',false,true),
('33333333-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','UE-JN-1006','Black Slim Jeans','Stretch black denim with a tapered leg.','Jeans','Lower Wear','male',3099,'Black','{28,30,32,34}','Slim','Stretch Denim','Casual','Everyday','{/products/black-slim-jeans.jpg}','lower_body',false,false),
('33333333-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','UE-TR-1007','Black Formal Trousers','Tailored trousers with a flat front and clean drape.','Trousers','Lower Wear','male',2899,'Black','{30,32,34,36}','Tailored','Wool Blend','Formal','Wedding','{/products/black-trousers.jpg}','lower_body',false,false),
('33333333-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','UE-JK-1008','Charcoal Bomber Jacket','Lightweight bomber with ribbed trims and a matte shell.','Jacket','Upper Wear','male',4999,'Charcoal','{S,M,L,XL}','Regular','Technical Nylon','Streetwear','Evening','{/products/charcoal-bomber.jpg}','upper_body',true,false),
('33333333-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','UE-OS-1009','Olive Overshirt','Boxy overshirt that layers over tees and knits.','Overshirt','Upper Wear','male',3499,'Olive','{S,M,L,XL}','Boxy','Cotton Canvas','Utility','Casual','{/products/olive-overshirt.jpg}','upper_body',true,false),
('33333333-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','UE-TS-1010','Sand Relaxed T-Shirt','Relaxed tee in a warm sand tone.','T-Shirt','Upper Wear','male',1299,'Sand','{S,M,L,XL}','Relaxed','Cotton','Minimal','Casual','{/products/sand-tshirt.jpg}','upper_body',false,false),
('33333333-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','UE-WT-2001','Ribbed Knit Top','Fitted ribbed knit top with a high neck.','Top','Upper Wear','female',1799,'Ivory','{XS,S,M,L}','Fitted','Rib Knit','Minimal','Casual','{/products/ribbed-knit-top.jpg}','upper_body',true,true),
('33333333-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','UE-WT-2002','Black Satin Blouse','Fluid satin blouse with a relaxed cut.','Top','Upper Wear','female',2599,'Black','{XS,S,M,L}','Relaxed','Satin','Evening','Party','{/products/black-satin-blouse.jpg}','upper_body',false,true),
('33333333-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111','UE-WD-2003','Emerald Midi Dress','Draped midi dress with a cinched waist.','Dress','One Piece','female',5499,'Emerald','{XS,S,M,L}','Regular','Viscose Crepe','Occasion','Wedding','{/products/emerald-midi-dress.jpg}','full_body',true,true),
('33333333-0000-0000-0000-000000000014','11111111-1111-1111-1111-111111111111','UE-WD-2004','Little Black Dress','Timeless sleeveless black dress.','Dress','One Piece','female',4799,'Black','{XS,S,M,L}','Slim','Stretch Crepe','Evening','Party','{/products/black-dress.jpg}','full_body',false,true),
('33333333-0000-0000-0000-000000000015','11111111-1111-1111-1111-111111111111','UE-WJ-2005','High Rise Straight Jeans','High rise straight jeans in a mid wash.','Jeans','Lower Wear','female',3399,'Blue','{24,26,28,30,32}','Straight','Rigid Denim','Casual','Everyday','{/products/women-straight-jeans.jpg}','lower_body',false,true),
('33333333-0000-0000-0000-000000000016','11111111-1111-1111-1111-111111111111','UE-WT-2006','Wide Leg Trousers','Fluid wide leg trousers with a pressed crease.','Trousers','Lower Wear','female',3199,'Stone','{XS,S,M,L}','Wide','Tencel Blend','Smart Casual','Office','{/products/wide-leg-trousers.jpg}','lower_body',true,false),
('33333333-0000-0000-0000-000000000017','11111111-1111-1111-1111-111111111111','UE-WJ-2007','Cropped Denim Jacket','Cropped trucker jacket in rinsed indigo.','Jacket','Upper Wear','female',4299,'Indigo','{XS,S,M,L}','Cropped','Denim','Casual','Everyday','{/products/cropped-denim-jacket.jpg}','upper_body',false,false),
('33333333-0000-0000-0000-000000000018','11111111-1111-1111-1111-111111111111','UE-WS-2008','Pleated Midi Skirt','Sunray pleated midi skirt with an elastic waist.','Skirt','Lower Wear','female',2899,'Champagne','{XS,S,M,L}','Regular','Recycled Polyester','Occasion','Party','{/products/pleated-midi-skirt.jpg}','lower_body',true,false),
('33333333-0000-0000-0000-000000000019','11111111-1111-1111-1111-111111111111','UE-AC-3001','White Leather Sneakers','Minimal low-top sneakers in full grain leather.','Sneakers','Footwear','unisex',4599,'White','{6,7,8,9,10,11}','Regular','Leather','Minimal','Everyday','{/products/white-sneakers.jpg}','accessory',false,true),
('33333333-0000-0000-0000-000000000020','11111111-1111-1111-1111-111111111111','UE-AC-3002','Tan Leather Belt','Hand finished leather belt with a brushed buckle.','Belt','Accessory','unisex',1899,'Tan','{S,M,L}','Regular','Leather','Classic','Office','{/products/tan-belt.jpg}','accessory',false,false);

-- inventory across all stores
INSERT INTO public.inventory (product_id, store_id, available_units, sold_units, section, floor, rack)
SELECT p.id, s.id,
  CASE WHEN p.product_code = 'UE-TS-1002' THEN (2 + (random()*3)::int)
       WHEN p.product_code = 'UE-WD-2003' THEN (1 + (random()*3)::int)
       ELSE (6 + (random()*40)::int) END,
  (5 + (random()*30)::int),
  CASE WHEN p.gender = 'female' THEN 'Women''s Section' WHEN p.gender = 'male' THEN 'Men''s Section' ELSE 'Studio' END,
  CASE WHEN p.gender = 'female' THEN 'Floor 2' ELSE 'Floor 1' END,
  'Rack ' || chr(65 + (random()*5)::int) || (10 + (random()*30)::int)::text
FROM public.products p CROSS JOIN public.stores s;

-- demo anonymous sessions
INSERT INTO public.anonymous_sessions (session_code, store_id, started_at, last_active_at, ended_at, is_demo)
SELECT 'session_' || substr(md5(random()::text),1,6),
  (SELECT id FROM public.stores ORDER BY random() LIMIT 1),
  now() - (random()*90)::int * interval '1 day',
  now() - (random()*90)::int * interval '1 day',
  now(), true
FROM generate_series(1,900);

-- demo engagement events
INSERT INTO public.analytics_events (session_id, store_id, product_id, event_type, query, is_demo, created_at)
SELECT s.id, s.store_id, p.id,
  (ARRAY['product_viewed','product_viewed','product_viewed','product_selected','try_on_started','try_on_completed','recommendation_clicked','find_in_store_clicked','qr_generated'])[1 + (random()*8)::int],
  NULL, true, s.started_at + (random()*20)::int * interval '1 minute'
FROM public.anonymous_sessions s
CROSS JOIN LATERAL (
  SELECT id, (CASE WHEN product_code IN ('UE-TS-1001','UE-SH-1004','UE-JN-1005','UE-TS-1002','UE-WD-2003') THEN 1 ELSE 0 END) w
  FROM public.products ORDER BY random() * (CASE WHEN product_code IN ('UE-TS-1001','UE-SH-1004','UE-JN-1005','UE-TS-1002','UE-WD-2003') THEN 0.35 ELSE 1 END) LIMIT 9
) p
WHERE s.is_demo;

-- demo search events
INSERT INTO public.analytics_events (session_id, store_id, event_type, query, is_demo, created_at)
SELECT s.id, s.store_id, 'search_performed', q.query, true, s.started_at + interval '1 minute'
FROM public.anonymous_sessions s
CROSS JOIN LATERAL (
  SELECT (ARRAY[
    'Oversized White T-Shirt','Black Formal Shirt','Straight Fit Jeans','black oversized t-shirt',
    'outfit for a wedding','formal clothes under 5000','something casual for college','white sneakers',
    'emerald dress','wide leg trousers','denim jacket women','linen shirt','oversized white tee','beige cargo pants'
  ])[1 + (random()*13)::int] AS query
  FROM generate_series(1, 1 + (random()*2)::int)
) q
WHERE s.is_demo;

-- demo AI interactions
INSERT INTO public.analytics_events (session_id, store_id, event_type, is_demo, created_at)
SELECT s.id, s.store_id, 'ai_message_sent', true, s.started_at + interval '2 minutes'
FROM public.anonymous_sessions s WHERE s.is_demo AND random() < 0.55;

-- demo POS sales
INSERT INTO public.sales (product_id, store_id, units, unit_price, total_value, source, is_demo, sold_at)
SELECT p.id, s.id, u.units, p.price, p.price * u.units, 'demo_pos', true,
  now() - (random()*90)::int * interval '1 day'
FROM public.products p
CROSS JOIN public.stores s
CROSS JOIN LATERAL (SELECT 1 + (random()*2)::int AS units) u
CROSS JOIN generate_series(1, 3 + (random()*10)::int);
