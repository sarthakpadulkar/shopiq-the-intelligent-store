# ShopIQ: The Intelligent Store

Build a complete, production-ready B2B AI retail application called SHOPIQ.

IMPORTANT:

Do not build this as a generic ecommerce website.

ShopIQ is an AI-powered in-store retail experience + retail intelligence platform designed for fashion brands, franchise networks, and multi-store retailers.

==================================================

1. PRODUCT CONCEPT

==================================================

ShopIQ has TWO experiences:

A) CUSTOMER / IN-STORE EXPERIENCE

B) BRAND / STORE ADMIN DASHBOARD

CUSTOMER:

- NO authentication

- NO signup

- NO login

- NO OTP

- NO Google login

- NO customer account

- NO wishlist

- NO gallery upload for virtual try-on

The customer simply walks up to the ShopIQ screen and starts using it.

ADMIN:

- Authentication REQUIRED

- Role-based access

- Brand Admin

- Store Manager

- Staff

- Super Admin

==================================================

2. CORE VALUE PROPOSITION

==================================================

ShopIQ connects:

Customer Intent

+

AI Shopping

+

Product Catalogue

+

Inventory

+

Virtual Try-On

+

In-Store Product Discovery

+

Retail Analytics

+

POS/ERP Sales Data

Customer gets a smarter physical shopping experience.

Retailer gets intelligence about what customers want, what they view, what they try, what they select, what is available, and what actually sells.

==================================================

3. DESIGN

==================================================

The entire application MUST use a premium futuristic GLASSMORPHISM UI.

Design language:

- Dark premium background

- Glassmorphism cards

- Transparent/translucent surfaces

- Backdrop blur

- Subtle borders

- Soft gradients

- Premium typography

- Elegant animations

- Smooth transitions

- Large product imagery

- Modern fashion-tech aesthetic

- Minimal clutter

- Large touch targets

The product should feel like:

LUXURY FASHION + AI + FUTURISTIC TECHNOLOGY

Do NOT create:

- Basic Bootstrap UI

- Generic ecommerce UI

- Cheap-looking dashboard

- Plain white SaaS interface

==================================================

4. APPLICATION STRUCTURE

==================================================

Create:

PUBLIC WEBSITE

/

 /features

 /request-demo

CUSTOMER EXPERIENCE

 /shop

 /shop/search

 /shop/product/:id

 /shop/assistant

 /shop/try-on

 /shop/try-on/result

 /shop/find-store

 /shop/qr/:id

ADMIN EXPERIENCE

 /admin/login

 /admin/dashboard

 /admin/products

 /admin/inventory

 /admin/stores

 /admin/sales

 /admin/search-analytics

 /admin/product-analytics

 /admin/demand-intelligence

 /admin/ai-insights

 /admin/settings

Protect all /admin routes.

Customer routes require NO authentication.

==================================================

5. CUSTOMER WELCOME SCREEN

==================================================

Create a premium cinematic welcome screen.

Logo:

SHOPIQ

Headline:

"Your AI-powered shopping assistant"

Primary CTA:

"Start Shopping"

Secondary actions:

- Search Products

- Explore Collection

- Build an Outfit

- Virtual Try-On

No authentication anywhere.

==================================================

6. ANONYMOUS CUSTOMER SESSION

==================================================

When the customer starts shopping, create an anonymous temporary session ID.

Example:

session_8f31a7

Track anonymous events:

- Session started

- Search

- Product view

- Product selection

- AI interaction

- Recommendation click

- Try-on

- Garment change

- Find-in-store

- QR generation

Do NOT collect:

- Name

- Email

- Phone

- Password

- Customer account

==================================================

7. CUSTOMER HOME

==================================================

Create a large touchscreen-optimized interface.

Main search:

"What are you looking for?"

Example queries:

"Show me black oversized T-shirts"

"I need an outfit for a wedding"

"Show me formal clothes under ₹5000"

"I want something casual for college"

Quick actions:

- Men's

- Women's

- New Arrivals

- Trending

- AI Recommendations

- Virtual Try-On

==================================================

8. AI PRODUCT SEARCH

==================================================

Natural-language AI search is a core feature.

Example:

Customer:

"Show me a black oversized T-shirt under ₹2000."

AI extracts:

Category = T-Shirt

Colour = Black

Fit = Oversized

Budget = ₹2000

Then query the actual product database.

IMPORTANT:

The AI must NEVER invent products.

Only show products that exist in the database.

Check inventory before recommending products.

==================================================

9. SEARCH RESULTS

==================================================

Create a premium product grid.

Each product card must contain:

- Product image

- Product name

- Price

- Category

- Available sizes

- Colours

- Availability

- Product code

Actions:

VIEW

TRY ON

Track:

- Product impression

- Product view

- Product click

==================================================

10. PRODUCT DETAILS

==================================================

Display:

- Large product image

- Product name

- Price

- Description

- Category

- Sizes

- Colours

- Style

- Material

- Occasion

- Availability

- Store location

Actions:

TRY THIS ON

FIND IN STORE

COMPLETE THE LOOK

==================================================

11. AUTOMATIC PRODUCT UNDERSTANDING

==================================================

Every product must have metadata.

Example:

SHIRT:

Category = Upper Wear

Type = Shirt

Gender = Male

Try-On Type = Upper Body

JEANS:

Category = Lower Wear

Type = Jeans

Try-On Type = Lower Body

DRESS:

Category = One Piece

Type = Dress

Gender = Female

Try-On Type = Full Body

The customer MUST NOT manually select:

- Male/Female

- Shirt/Pants/Dress

- Upper/Lower body

The system must determine the correct behaviour from product metadata.

==================================================

12. VIRTUAL TRY-ON

==================================================

Virtual Try-On is a CORE ShopIQ feature.

CRITICAL RULE:

The customer takes ONE photo using the DEVICE CAMERA.

There must be NO:

- Gallery upload

- File upload

- Choose image

- Drag and drop

ONLY:

OPEN CAMERA

+

TAKE PHOTO

==================================================

13. TRY-ON FLOW

==================================================

Customer clicks:

TRY ON

↓

Open device camera

↓

Customer takes ONE photo

↓

Create temporary Try-On Session

↓

Process person image

↓

Apply selected garment

↓

Show result

After this:

Customer can select another garment.

The SAME original photo MUST be reused.

Do NOT open the camera again.

Do NOT ask for another photo.

Do NOT ask the customer to upload another photo.

==================================================

14. MULTIPLE GARMENTS USING ONE PHOTO

==================================================

Example:

ONE PHOTO

↓

Black Shirt

↓

Try On

↓

Blue Jeans

↓

Try On

↓

Jacket

↓

Try On

↓

Different Dress / Garment

↓

Try On

All using the SAME original camera photo.

The customer should be able to switch between garments without repeating the camera process.

==================================================

15. INSTANT GARMENT SWITCHING

==================================================

When the customer clicks another garment:

Immediately update the try-on result using the existing try-on session.

Do NOT:

- Open camera

- Ask for another image

- Show gallery

- Ask gender

- Ask garment category

Product metadata already contains this information.

==================================================

16. GARMENT-SPECIFIC TRY-ON

==================================================

Shirt:

Apply to upper body.

T-shirt:

Apply to upper body.

Jacket:

Apply to upper body.

Pants:

Apply to lower body.

Jeans:

Apply to lower body.

Skirt:

Apply to lower body.

Dress:

Apply to full body.

Full outfit:

Combine compatible garments.

==================================================

17. TRY-ON UI

==================================================

Show:

CURRENT LOOK

[Large Try-On Result]

Below it:

Recommended / Similar Products

[Product] [Product] [Product] [Product]

When customer taps another product:

Immediately update the try-on.

No new photo.

==================================================

18. TRY-ON SESSION

==================================================

Temporary session contains:

- Original camera photo

- Current garment

- Selected garments

- Current outfit

- Try-on results

Provide:

END TRY-ON SESSION

When ended:

- Clear temporary photo

- Clear temporary try-on data

- Clear selected garments

==================================================

19. TRY-ON PRIVACY

==================================================

Display:

"Your photo is used only for this try-on session."

Requirements:

- No gallery upload

- No public photo

- No customer account

- Temporary session

- Secure image processing

- Clear session when finished

- Configurable retention policy

==================================================

20. AI SHOPPING ASSISTANT

==================================================

Create a conversational AI assistant.

Examples:

"What should I wear to a wedding?"

"Show something similar but cheaper."

"I want a black outfit."

"What goes with these jeans?"

"Show me something for college."

The AI must use the actual store catalogue and inventory.

==================================================

21. AI RECOMMENDATIONS

==================================================

Recommendations should consider:

- Customer query

- Product metadata

- Inventory

- Selected product

- Style

- Colour

- Occasion

- Budget

- Availability

Never recommend unavailable products as if they are available.

==================================================

22. COMPLETE THE LOOK

==================================================

When a customer selects a product, ShopIQ should recommend complementary products.

Example:

WHITE SHIRT

+

BLACK TROUSERS

+

WHITE SNEAKERS

+

JACKET

Each product:

- View

- Try On

- Find In Store

==================================================

23. FIND IN STORE

==================================================

Every product can contain physical store location.

Example:

AVAILABLE

Men's Section

Floor 1

Rack A12

3 Units Available

Create a visual store-location UI.

==================================================

24. EXPLORE

==================================================

Customer can browse:

- New Arrivals

- Trending

- Best Sellers

- Collections

- Categories

- Offers

==================================================

25. QR SHARING

==================================================

Customer can generate QR codes for:

- Product

- Outfit

- Try-on result

QR opens a mobile-friendly ShopIQ page.

No login required.

==================================================

26. ADMIN AUTHENTICATION

==================================================

Admin login:

Email

Password

Implement:

- Secure authentication

- Session management

- Logout

- Role-based access

Roles:

SUPER ADMIN

BRAND ADMIN

STORE MANAGER

STAFF

==================================================

27. ADMIN DASHBOARD

==================================================

This is one of the MOST IMPORTANT parts of ShopIQ.

The dashboard allows brands and stores to understand customer behaviour and product performance.

Dashboard metrics:

CUSTOMER ENGAGEMENT:

- Total sessions

- Total interactions

- Searches

- Product views

- Product selections

- AI conversations

- Try-ons

- QR scans

PRODUCT PERFORMANCE:

- Most viewed products

- Most searched products

- Most tried-on products

- Most selected products

- Best performing products

SALES:

- Units sold

- Sales value

- Sales by product

- Sales by category

- Sales by store

- Conversion

==================================================

28. ACTUAL SALES

==================================================

IMPORTANT:

ShopIQ must NOT fake sales data.

Actual sales must come from:

POS / ERP / Sales System

Architecture:

POS / ERP

↓

Integration Layer

↓

ShopIQ

↓

Analytics Dashboard

If POS/ERP integration is unavailable:

show engagement analytics only.

Do not pretend product views are sales.

==================================================

29. PRODUCT PERFORMANCE TABLE

==================================================

Create a dashboard table:

Product

Views

Searches

Try-ons

Units Sold

Conversion

Example:

Black Oversized T-Shirt

1240 views

320 searches

380 try-ons

96 sold

7.7% conversion

Blue Jeans

920 views

210 searches

210 try-ons

82 sold

8.9% conversion

White Shirt

1450 views

410 searches

510 try-ons

145 sold

10.0% conversion

Use demo data only when clearly marked as demo data.

==================================================

30. PRODUCT CONVERSION

==================================================

When valid sales data exists:

Product Conversion =

Units Sold / Product Views

Also calculate:

View → Try-On

View → Selection

Try-On → Sale

Overall Conversion

==================================================

31. SEARCH ANALYTICS

==================================================

Dashboard should show:

- Top searches

- Search volume

- Search trends

- Popular categories

- Popular colours

- Popular sizes

- Popular styles

- Popular occasions

Example:

TOP SEARCH:

Oversized White T-Shirt

127 searches

Black Formal Shirt

94 searches

Straight Fit Jeans

81 searches

==================================================

32. DEMAND INTELLIGENCE

==================================================

Detect products customers repeatedly search for but cannot find.

Example:

HIGH DEMAND

Oversized White T-Shirt

Searches: 127

Available Units: 4

Potential unmet demand detected.

Create a dedicated:

DEMAND INTELLIGENCE

page.

==================================================

33. PRODUCT ANALYTICS

==================================================

For each product track:

- Impressions

- Views

- Searches

- Selections

- Try-ons

- QR scans

- Inventory

- Sales

- Revenue

- Conversion

- Demand

==================================================

34. CATEGORY ANALYTICS

==================================================

Analyze:

- Shirts

- T-shirts

- Jeans

- Trousers

- Dresses

- Jackets

- etc.

Metrics:

- Views

- Searches

- Try-ons

- Sales

- Revenue

- Conversion

==================================================

35. STORE ANALYTICS

==================================================

Each store dashboard should show:

- Sessions

- Interactions

- Searches

- Product views

- Try-ons

- Product selections

- Sales

- Revenue

- Conversion

- Top products

- Top categories

- Unmet demand

==================================================

36. MULTI-STORE MANAGEMENT

==================================================

Brand admins can manage multiple stores.

Example:

Brand

├── Mumbai

│   ├── Store 01

│   └── Store 02

├── Pune

│   ├── Store 01

│   └── Store 02

└── Bengaluru

    ├── Store 01

    └── Store 02

Allow:

- Store comparison

- Product comparison

- Category comparison

- Sales comparison

- Demand comparison

==================================================

37. PRODUCT MANAGEMENT

==================================================

Admin can:

- Add product

- Edit product

- Delete product

- Update price

- Update inventory

- Add images

- Assign category

- Assign gender

- Assign sizes

- Assign colours

- Assign style

- Assign occasion

- Assign store

- Assign location

- Assign try-on type

==================================================

38. PRODUCT DATABASE

==================================================

Use:

id

name

description

category

subcategory

gender

price

brand

colour

sizes

fit

material

style

occasion

images

inventory

store_id

location

product_code

try_on_type

Try-on types:

upper_body

lower_body

full_body

accessory

==================================================

39. INVENTORY

==================================================

Track:

- Product

- Store

- Available units

- Sold units

- Stock status

- Rack/location

Statuses:

IN STOCK

LOW STOCK

OUT OF STOCK

==================================================

40. POS/ERP INTEGRATION

==================================================

Create a clean integration/service abstraction so POS and ERP systems can be connected later.

POS / ERP

↓

Integration API

↓

ShopIQ

↓

Sales + Inventory + Analytics

Do not tightly couple the application to one POS provider.

==================================================

41. DATABASE

==================================================

Use Supabase/PostgreSQL.

Tables:

users

roles

brands

stores

products

product_variants

inventory

anonymous_sessions

search_events

product_view_events

product_selection_events

ai_interactions

try_on_sessions

try_on_events

qr_events

sales

analytics

Use proper relationships and indexes.

==================================================

42. ANALYTICS EVENTS

==================================================

Track:

session_started

search_performed

product_viewed

product_selected

ai_message_sent

recommendation_clicked

try_on_started

try_on_completed

garment_changed

find_in_store_clicked

qr_generated

Sales:

sale_recorded

Sales events must originate from POS/ERP or verified imported data.

==================================================

43. AI ARCHITECTURE

==================================================

Never expose private AI API keys in frontend code.

Use:

Frontend

↓

Secure Backend / Edge Function

↓

AI Provider

↓

Product Database

↓

Inventory

↓

AI Response

↓

Frontend

AI must retrieve real product information.

==================================================

44. TRY-ON ARCHITECTURE

==================================================

Camera

↓

ONE PHOTO

↓

Temporary Try-On Session

↓

Person Processing

↓

Garment Selection

↓

Virtual Try-On

↓

Result

↓

Select Another Garment

↓

Reuse SAME Photo

↓

New Result

==================================================

45. CAMERA REQUIREMENTS

==================================================

When Try-On starts:

1. Request camera permission.

2. Open device camera.

3. Show camera preview.

4. Show Take Photo.

5. Capture image.

6. Create try-on session.

DO NOT show:

- Gallery

- Upload

- Choose file

==================================================

46. SHARED SCREEN SESSION RESET

==================================================

The ShopIQ screen is shared by many customers.

Automatically reset inactive sessions.

After configurable inactivity:

- Clear anonymous session

- Clear selected products

- Clear AI conversation

- Clear try-on photo

- Clear temporary data

- Return to Welcome Screen

Also provide:

START NEW SESSION

==================================================

47. SECURITY

==================================================

Implement:

- Secure admin authentication

- Protected routes

- Role-based permissions

- Database security policies

- Server-side AI keys

- Input validation

- Secure APIs

- Session isolation

- Audit logs

==================================================

48. LANDING PAGE

==================================================

Create a premium ShopIQ landing page.

Hero:

THE AI LAYER FOR PHYSICAL RETAIL

Subheading:

"Help customers discover more. Help retailers understand demand."

CTA:

REQUEST A DEMO

Secondary:

EXPLORE SHOPIQ

Sections:

Problem

Solution

AI Shopping

Virtual Try-On

Find In Store

Retail Intelligence

Sales Analytics

Multi-Store Management

POS/ERP Integration

Final CTA:

"Build the future of in-store retail with ShopIQ."

==================================================

49. DEMO DATA

==================================================

Create a fictional demo brand:

UrbanEdge

Demo Store:

Pune Central

DO NOT claim that Zudio, Raymond, or any real company is already a ShopIQ customer.

Create realistic demo products:

MEN:

- T-shirts

- Shirts

- Jeans

- Trousers

- Jackets

- Overshirts

WOMEN:

- Tops

- Dresses

- Jeans

- Trousers

- Jackets

- Skirts

Include:

- Images

- Sizes

- Colours

- Prices

- Inventory

- Store locations

- Try-on metadata

==================================================

50. DEMO ANALYTICS

==================================================

Populate realistic DEMO analytics:

- Product views

- Searches

- Try-ons

- Product selections

- QR scans

- Inventory

- Sales

- Revenue

- Conversion

- Demand trends

Clearly label demo data as:

DEMO DATA

==================================================

51. RESPONSIVE DESIGN

==================================================

Customer experience:

Optimize primarily for large touchscreen displays.

Admin:

Optimize for desktop/tablet.

QR experience:

Optimize for mobile.

==================================================

52. PERFORMANCE

==================================================

Use:

- Image optimization

- Lazy loading

- Caching

- Debounced search

- Skeleton loaders

- Optimized database queries

- Fast navigation

- Streaming AI responses where appropriate

Try-on loading state:

"Creating your look..."

Use an elegant animated loading experience.

==================================================

53. ERROR STATES

==================================================

Camera denied:

"Camera access is required for Virtual Try-On."

AI unavailable:

"AI shopping is temporarily unavailable. You can continue browsing products."

Try-on failure:

"We couldn't create the try-on right now. Please try again."

Product unavailable:

"This product is currently unavailable."

Never expose technical errors.

==================================================

54. DO NOT BUILD

==================================================

DO NOT implement:

- Customer authentication

- Customer signup

- Customer OTP

- Customer Google login

- Customer profiles

- Wishlist

- Gallery upload for try-on

- Hardware management module

- Fake sales presented as real

- Fake partnerships with real brands

==================================================

55. FINAL CUSTOMER FLOW

==================================================

Customer

↓

ShopIQ Screen

↓

Start Shopping

↓

NO LOGIN

↓

AI Search

↓

Product Discovery

↓

Product

↓

Try On

↓

ONE CAMERA PHOTO

↓

Try-On Session

↓

Shirt

↓

Instant Try-On

↓

Pants

↓

SAME PHOTO

↓

Instant Try-On

↓

Jacket

↓

SAME PHOTO

↓

Complete Look

↓

Find In Store

↓

QR

==================================================

56. FINAL RETAILER FLOW

==================================================

Brand / Store

↓

Secure Login

↓

Dashboard

↓

Customer Sessions

↓

Searches

↓

Product Views

↓

Try-Ons

↓

Product Selections

↓

Inventory

↓

POS / ERP Sales

↓

Conversion

↓

Demand Intelligence

↓

AI Retail Insights

==================================================

57. MOST IMPORTANT DASHBOARD QUESTIONS

==================================================

The dashboard must clearly answer:

1. Which products get the most views?

2. Which products are searched the most?

3. Which products are tried on the most?

4. Which products are selected the most?

5. Which products actually sell the most?

6. Which products have the highest conversion?

7. Which categories are most popular?

8. Which colours are most demanded?

9. Which sizes are most demanded?

10. What are customers searching for?

11. What products are customers searching for but cannot find?

12. Which stores perform best?

13. Which products have high interest but low inventory?

14. Which products generate the most revenue?

==================================================

58. FINAL POSITIONING

==================================================

ShopIQ is NOT a normal ecommerce app.

ShopIQ is:

"An AI-powered in-store retail experience and intelligence platform connecting customer intent, product discovery, inventory, virtual try-on, and sales analytics."

Customer:

DISCOVER → ASK → TRY → FIND → SHOP

Retailer:

OBSERVE → UNDERSTAND → ANALYZE → OPTIMIZE

Build the complete application around this positioning.

Make it feel like a premium enterprise product built for large fashion retailers and franchise networks.

IMPORTANT:

Prioritize functional features over static mockups.

Create reusable components.

Create proper database schemas.

Create working navigation.

Create working authentication for admins.

Create anonymous customer sessions.

Create working analytics event architecture.

Create realistic demo data.

Create clean service abstractions for AI, virtual try-on, POS/ERP and inventory integrations.

If an external AI/virtual try-on API is not configured, create the correct service abstraction and a clearly marked demo/fallback implementation so the application remains functional without exposing API keys.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5be5d2a1-71e1-4b28-945c-f79baa74d5b1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
