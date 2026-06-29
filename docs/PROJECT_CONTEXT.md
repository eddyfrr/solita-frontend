# Solita Beauty Bar — Project Context

> Single source of truth for how this project is built, deployed, and wired together.
> Written so any agent (or human) can ramp up without re-explaining. Keep it current.

## What this is
Solita Beauty Bar — a luxury hair salon storefront for a Tanzania-based business.
Customers browse/buy hair products, book braiding/styling services, and view a gallery.
There's a VIP tier and a multi-currency, EN/SW bilingual UI. Brand theme: brown/gold
(`#8B5E3C` accent, `#FDFAF6` background, Playfair Display + Jost fonts).

## Two repos, two deploys
This working directory (`/Users/mac/my-clone`) contains **both** apps, but they are
**separate git repositories** that deploy independently:

| Part | Path | Git remote | Branch | Deploy |
|------|------|-----------|--------|--------|
| Frontend | repo root (`src/`, `public/`) | `github.com/eddyfrr/solita-frontend` | `main` | Vercel (auto-deploy on push) |
| Backend | `backend/` (nested own `.git`) | `github.com/eddyfrr/solita-salon` | `main` | Azure App Service (migrated from Railway) |

To make a **frontend** change live: commit + push to `eddyfrr/solita-frontend` `main` → Vercel redeploys (~1–3 min).
To make a **backend** change live: commit + push to `eddyfrr/solita-salon` `main` → Azure redeploys.

> Note: `.github/workflows/ci.yml` triggers on `master` (not `main`), so that CI workflow
> does **not** run for the live `main` branch — Vercel's own pipeline handles deploy.

## Frontend stack
- **Next.js 16** (App Router, `output: "standalone"`), **React 19**, **TypeScript strict**
- **Tailwind CSS v4** (oklch tokens), **shadcn/ui** (Radix/base-ui), **lucide-react** icons
- Heavy use of inline `style={{}}` for pixel-matched values alongside Tailwind utilities
- Read project guides in `node_modules/next/dist/docs/` before using Next APIs — this is
  Next 16 with breaking changes vs. older training data (per AGENTS.md).

### Data flow (important)
- **`src/lib/server-api.ts`** — server-side fetches from the Django API
  (`API_URL`/`NEXT_PUBLIC_API_URL`, default `http://localhost:8000/api`), `revalidate: 10s`.
  **The admin DB is the source of truth.** Upgrades Cloudinary `http://`→`https://`.
- **`src/data/products.ts`, `src/data/services.ts`** — static fallback content used only
  when the API returns nothing (backend down). Pages render API data first, static second.
- **`src/lib/api.ts`** — client-side admin CRUD. JWT access/refresh stored in
  `localStorage` (`admin-tokens`, `admin-user`); auto-refresh on 401, redirect to
  `/admin/login` on failure.

### Routes
Public: `/` (home), `/shop`, `/product/[slug]`, `/product-category/[slug]`, `/services`,
`/services/[slug]`, `/book/[serviceSlug]/[styleSlug]`, `/booking/success|failed`, `/cart`,
`/checkout`, `/wishlist`, `/gallery`, `/about`, `/contact`, `/vip`, `/search`,
`/influencer-application-form`, `/category/tutorials`, `/info`.
Admin (JWT-gated `/admin/*`): dashboard, products (+new/[slug]), services (+styles/add-style),
bookings, orders, gallery, login.

### Notable components / context
- `HeroSection.tsx` — full-bleed hero. Image is **admin-editable**: the homepage fetches
  `GET /api/site-settings/` (`hero_image_url`) and passes it in; falls back to the static
  `public/images/hero-banner.jpg` when none is set. Admin uploads/crops it at `/admin/homepage`
  (backend: `SiteSettings` singleton model, `PATCH /api/site-settings/`, admin-only).
- `CurrencyContext.tsx` — TZS default + USD/KES/GBP/EUR/NGN/ZAR selector; `Price.tsx` formats.
- `CartContext.tsx` — cart state. `LanguageSelector` + `GoogleTranslate` for EN/SW.

## Backend stack (`backend/`)
- **Django 5.1.7** + **DRF 3.15** + **SimpleJWT** (12h access / 7d refresh)
- **Cloudinary** for media (product/service/gallery images); **whitenoise** static; **gunicorn**
- DB: Postgres in prod via `DATABASE_URL`; SQLite (`db.sqlite3`) locally
- Active app is **`api`** only. App label `booking` exists on disk (legacy
  `Service/ServiceType/Appointment/ClientPhoto` models + `validators.py`) but is **NOT** in
  `INSTALLED_APPS` — only `booking.validators.AlphanumericValidator` is referenced. Treat the
  `booking` app's models as dead code; the live models all live in `api/models.py`.

### Models (`api/models.py`) — the real schema
`ProductCategory`, `Product` (+`ProductImage`), `Service`, `ServiceStyle`
(has `vip_price`, plus `lengths`/`colors`/`types` JSON arrays, `duration`),
`ServiceStyleImage` (carousel), `Booking` (guest checkout; status + payment_method:
mpesa/card/cash), `Order` (+`OrderItem`), `GalleryPhoto`.

### API surface (`/api/...`)
Router: `products`, `categories`, `services`, `bookings`, `orders`, `gallery`.
Auth: `auth/login|register|me|token/refresh`. Dashboard: `dashboard/stats`.
Nested: service styles + style images, product images.
Availability: `bookings/availability/?date=` (per-day slot capacity).
Payments: `payments/initiate`, `payments/callback` (**ClickPesa**).
Booking creation is throttled `6/min`.

### Catalog seeding
Prefer idempotent management commands over manual admin entry:
`api/management/commands/seed_products.py`, `seed_static_catalog.py`;
`booking/management/commands/create_admin.py`.

## Integrations & config (env-driven, in `backend/.env`)
- **ClickPesa** (active payment gateway): `CLICKPESA_CLIENT_ID`, `CLICKPESA_API_KEY`,
  `CLICKPESA_API_URL`, success/failure URLs.
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Email**: Gmail SMTP (`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD`) + `ELASTICEMAIL_API_KEY`.
- **Core**: `SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`,
  `CORS_ALLOWED_ORIGINS`.
- **WhatsApp** business number hardcoded in settings: `255766363233`.
- Prod hardening (when `DEBUG=False`): HSTS, secure cookies, trusts `X-Forwarded-Proto`
  (Azure terminates TLS). `settings.py` defaults still name Railway hosts — prod overrides
  via env vars (Azure: app `solita-backend-edmund`, RG `solita-prod`, domain `solitabeautybar.me`).

## Known caveats / open items
- ClickPesa keys currently in env are from a **deactivated** account; a new account is pending.
- Cloudinary API secret still needs rotation (leftover from a past secret-leak cleanup).
- `booking` app models are dead; don't extend them — add to `api`.
- Lint reports many pre-existing errors/warnings repo-wide; `typecheck` is clean. Don't treat
  the existing lint noise as blocking, but don't add new issues.

## Common commands
Frontend: `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run check`
Backend: `python manage.py runserver` · `migrate` · `seed_products` · `seed_static_catalog`
