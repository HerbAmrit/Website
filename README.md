# HerbAmrit — Tea Shop E-Commerce Platform

A production-track e-commerce platform for a premium tea brand. Built as a "feels like an SPA"
React app (smooth-scroll marketing sections + real client-side routes for shop/checkout/account
so products stay indexable and shareable) with a Node/Express + PostgreSQL backend.

> Brand name is **HerbAmrit**, set in `frontend/src/data/brand.js` — every component reads from
> that one file, so any further rebrand only needs an edit there (plus `frontend/index.html`,
> which is static HTML and can't read `brand.js` at load time).

---

## Why client-side routing instead of one URL

The original brief asked for a single-URL SPA, but also asked for per-page SEO metadata,
canonical URLs, and a sitemap — those need real, distinct, crawlable URLs. This build uses
React Router so:

- `/` is the marketing homepage — Hero, About, Shop preview, Brew Guide teaser, Loyalty,
  Contact — all smooth-scrolled, exactly like a single-page site.
- `/shop`, `/shop/:slug`, `/cart`, `/checkout`, `/account`, `/account/orders` are real routes
  with their own `<title>`/meta tags and shareable, bookmarkable, indexable URLs.
- Navigating within the marketing sections never triggers a page reload. Navigating to a
  product still doesn't reload the page (React Router is client-side) — it just changes the URL
  and swaps content, so it *feels* identical to scrolling, but Google can index
  `/shop/darjeeling-first-flush` on its own.

---

## Architecture

```
tea-shop-ecommerce/
├── frontend/          React 18 + Vite + Tailwind + React Router
└── backend/           Node.js + Express + PostgreSQL + Prisma ORM
```

**Frontend stack:** React, Vite, React Router v6, Tailwind CSS, Framer Motion (section reveals),
Context API for cart/wishlist state.

**Backend stack:** Express, Prisma ORM (PostgreSQL), JWT auth, Razorpay SDK, Twilio (WhatsApp), PDFKit (GST invoices).

Full data model (all entities across all phases) lives in `backend/prisma/schema.prisma` —
it's written now so nothing needs re-architecting later, even though only some routes are wired
up yet (see Roadmap below).

---

## Build roadmap

This is being built in phases so each layer is testable before the next is stacked on top.

| Phase | Scope | Status |
|---|---|---|
| **1** | Storefront: catalog, product routing, cart, wishlist, brew guide, WhatsApp button, Amazon cross-sell button, homepage sections | ✅ done |
| **2** | Checkout: login/register, coupon engine, Razorpay integration (UPI/Visa/Mastercard), order creation, GST invoice PDF, order history | ✅ done |
| **3** | Admin dashboard: product/inventory/order/coupon/customer management, sales analytics, CSV/PDF report export | ✅ done |
| **4** | Loyalty points, WhatsApp notifications, admin-editable site settings | ✅ this delivery |

**All four build phases, plus SEO files and policy pages, are now complete.** What's left before
this can go live for real customers is content, credentials, and hosting — not code. See "Going
live" below.

### What Phase 4 added

- **Loyalty points:** earned automatically on every paid order (rate is admin-configurable),
  redeemable at checkout against the order total, with a customer-facing balance + history page
  at `/account/loyalty`
- **WhatsApp notifications:** order confirmed, shipped, delivered, and cancelled — sent via
  Twilio's WhatsApp channel. If credentials aren't configured, messages log to the console
  instead of crashing, so the app runs fine before you've set up a provider
- **Admin-editable site settings:** social links, WhatsApp number, Amazon store URL, contact
  info, and loyalty rates now live in the database and are editable from `/admin/settings` —
  previously these were hardcoded in `frontend/src/data/brand.js`. The frontend fetches them at
  load time and falls back to the old hardcoded values if the backend is unreachable
- **Test notifications:** the admin settings page can send a real test WhatsApp message to
  confirm your Twilio credentials actually work before relying on them

### Latest changes — WhatsApp-only messaging, product photos

- **No email service anymore.** Nothing in the app sends email. Customer order updates
  (confirmed / shipped / delivered / cancelled) go out by WhatsApp to the number the customer
  gave at checkout (mandatory), and website contact-form messages plus new-order alerts go to the
  owner's WhatsApp number, editable in `/admin/settings`. Every contact message is also saved
  in the database and shown under **Admin → Messages**, so none is lost if WhatsApp fails.
- **Signup is a single step** (name, email, password). The email is only a login ID — it is
  format-checked but not verified, since no email is ever sent.
- **Product photos (max 5 per product).** In **Admin → Products**, create or edit a product and
  use the *Photos* section: add up to 5 JPG/PNG/WebP photos (shrunk in the browser before
  upload), mark one as the main photo, or delete them. Photos are stored in the database
  (`ProductImage` table) and served from `/api/images/<id>`, so they survive redeploys. The shop,
  product page (with a thumbnail gallery), cart and checkout all show them; a leaf icon appears
  for products without a photo.
- **Heads-up on WhatsApp delivery:** WhatsApp only lets a business send free-form messages to
  someone who messaged that number in the last 24 hours. Everything else needs Meta-approved
  message templates, which must be set up in Twilio before customer updates arrive reliably.

**New environment variable names** — `backend/.env` no longer needs any `SMTP_*` values.
Twilio uses `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `DEFAULT_COUNTRY_CODE`.

**This changes the database, so a migration is required** — after pulling these changes, run in
`backend/` (after `npm install`):
```
npx prisma migrate dev --name images_and_remove_email_verification
```
It adds the `ProductImage` table and drops the unused `EmailVerification` table. If Prisma warns
about dropping `EmailVerification`, that is expected — it only held unfinished signups.

### What this delivery added (SEO files + policy pages)

- **`sitemap.xml`:** generated dynamically by the backend at `/sitemap.xml` (not a static file)
  — it queries live, active products so it never goes stale as your catalog changes. Includes
  the homepage, `/shop`, every active product page, and the four policy pages
- **`robots.txt`:** static file at `frontend/public/robots.txt`, blocks crawling of
  `/admin`, `/account`, `/checkout`, `/cart`
- **Policy pages:** real pages (not placeholder footer text) for Privacy Policy, Terms of
  Service, Shipping Policy, and Returns & Refunds Policy — footer links now go somewhere.
  **This is boilerplate content, not legal advice** — replace the bracketed placeholders
  (return windows, jurisdiction, dates) with your actual policy and have a lawyer review before
  publishing. The Returns policy is written for a food/consumable product (no returns on opened
  tea for hygiene reasons, only for damaged/wrong/defective items) rather than generic retail
  returns, since that's the realistic policy a tea business would run

#### SEO files on a split frontend/backend deployment

Since the frontend and backend usually deploy to different hosts, `/sitemap.xml` needs a rewrite
rule on your frontend host so `www.your-domain.com/sitemap.xml` forwards to the backend. Two
common setups:

**Vercel** — add to `vercel.json` in the frontend project:
```json
{
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "https://your-backend-url.com/sitemap.xml" }
  ]
}
```

**Netlify** — add to `frontend/public/_redirects`:
```
/sitemap.xml  https://your-backend-url.com/sitemap.xml  200
```

Also update the `Sitemap:` line in `frontend/public/robots.txt` to your real domain once you
have one.

### Going live — what's left

This is no longer a coding task — it's accounts, content, and deployment:

1. **Credentials:** Razorpay live keys (test mode is already working), GST number,
   Twilio WhatsApp sender (or swap in `backend/src/services/whatsapp.service.js`)
2. **Content:** upload your real product photos in Admin → Products, final descriptions/pricing, and
   filling in the bracketed placeholders in the four policy pages (`frontend/src/pages/policies/`)
   with your actual policy — then a lawyer's review before publishing
3. **Replace the seeded admin account** (`admin@herbamrit.com` / `Admin@12345`) before this is
   ever public — see "Setting up your real admin account" below
4. **Hosting:** frontend (Vercel/Netlify), backend (Railway/Render), managed PostgreSQL, a
   domain with SSL, environment variables set on the live server, and the sitemap rewrite rule
   described above
5. **Pre-launch checks:** a real small live-mode payment test, mobile/cross-browser pass

### Setting up your real admin account

There's deliberately no admin-signup page (letting anyone create an admin account from the
public site would be a security hole), so replacing the seeded one takes a couple of manual
steps:

1. **Register a normal account** on the live site using your real email — e.g.
   `admin@herbamrit.com` if that's the address you want, or any email you actually control. This
   is a normal one-step signup.
2. **Open Prisma Studio**, pointed at the same database your app is using:
   ```
   npx prisma studio
   ```
   (run from `backend/`, with `DATABASE_URL` in `.env` set to your real database)
3. In the `User` table, find the account you just created and change its `role` field from
   `CUSTOMER` to `ADMIN`. Save.
4. Find the old seeded row where `email` is `admin@herbamrit.com` (if that's not the email you
   used in step 1) and **delete it** — this permanently retires the known, published placeholder
   password.
5. Log in at `/admin` with your real email and the password you chose in step 1.

There's no separate "set password" step — your real password is whatever you typed during
registration in step 1; Prisma Studio only changes the `role` flag, it never needs to touch or
see the password itself.

---

## Getting started

This sandbox has no internet access, so dependencies haven't been installed or run here — do
that on your machine:

```bash
# Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173

# Backend
cd backend
npm install
cp .env.example .env    # fill in real credentials (see below)
npx prisma migrate dev  # creates the Postgres schema
npm run dev              # http://localhost:4000
```

## Environment variables you'll need to supply later

Everything below has a placeholder in `backend/.env.example`. Nothing needs code changes when
you add these — just fill in the `.env` file:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — random long string for signing auth tokens
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay dashboard
- `RAZORPAY_WEBHOOK_SECRET` — for verifying payment webhooks
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` — WhatsApp messaging via
  Twilio (swap `backend/src/services/whatsapp.service.js` for another provider if you prefer)
- `DEFAULT_COUNTRY_CODE` — prepended to customer phone numbers entered without a country code
- `GST_BUSINESS_NAME` / `GST_NUMBER` / `GST_BUSINESS_ADDRESS` — printed on invoices

Amazon store URL, WhatsApp number, social links, and loyalty rates are **not** env
variables — they're editable at `/admin/settings` once the app is running (see Phase 4 below).

Until these are filled in, the app runs fully in a "dev/demo" mode: products come from seed
data, and Phase-2+ routes will simply return a clear "not configured yet" response instead of
crashing.

---

## Design notes

Brand palette: warm beige (primary surfaces), deep bottle-green (secondary — nav, footer,
buttons), antique gold (sparing accent), white (contrast on dark). Display type is a serif
(`Fraunces`) for headings, paired with `Inter` for body text. The signature visual element is
the **brew ring** — a circular steeping-progress indicator used on every product's Brew Guide,
doubling as a literal interactive tea timer and as the site's recurring visual motif.
