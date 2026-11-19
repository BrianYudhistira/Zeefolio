<div align="center">

# ZeeFolio

**Multi-User Developer Portfolio & Content Management Platform**

[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Spatie Permission](https://img.shields.io/badge/Spatie_RBAC-8.x-10B981?style=for-the-badge&logo=php&logoColor=white)](https://spatie.be/docs/laravel-permission)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

*A multi-user developer portfolio and content management platform built with **Laravel 13**, **Inertia.js v2**, and **React 18**. Each user gets a customizable public portfolio under `/{slug}`, time-series view analytics, real-time Server-Sent Events (SSE) notifications, and a dual-theme role-based management dashboard.*

[**📖 Full Architecture & Business Process Documentation (`docs/README.md`)**](./docs/README.md)

</div>

---

## Key Features

- **Multi-Tenant Public Portfolio (`/{slug}`)**: Dedicated landing page, projects archive (`/{slug}/projects`), and project detail showcase (`/{slug}/projects/{projectSlug}`) with `Active`/`Draft` visibility control, canonical `301` slug redirects, and a rate-limited contact mailer (`SendMailToMe` via database queue).
- **Portfolio Content Builder (`/admin/*`)**:
  - **Home & Profile**: Hero greeting, bio (min. 50 chars for SEO indexability), passions tags, social links (`http`/`https`), avatar/logo/CV upload, and custom URL slug.
  - **Projects & Showcase Gallery**: Project CRUD, multi-image showcase blocks with path-ownership verification, featured toggle, and per-user custom project categories.
  - **Skills & Display Categories**: Pick from global default skills or create custom tech stacks with live Devicon previews, set proficiency levels (`1–5`), select 1–4 featured skill categories, and manage custom skill categories.
  - **Career Experiences & Contacts**: Chronologically auto-indexed work/education history with hydrated tech stack badges, plus public contact channels.
- **View Analytics & System Audit Trail**:
  - **Dashboard Analytics**: Interactive `ViewsChart` (`1h`, `5h`, `24h`, `1w`, `1m`, `3m`, `6m`, `1y`) backed by 10-minute IP-hash deduplicated view tracking (`PortfolioView`) and prefetch filtering.
  - **Activity Logs**: Unified horizontal-scroll audit table with interactive KPI filter cards, `300ms` debounced search, and automatic 180-day retention pruning.
- **Real-Time Notifications via SSE**: Native Laravel 13 `response()->eventStream()` (`GET /admin/notifications/stream`) paired with an Inertia Persistent `AdminLayout` so the `EventSource` connection stays alive across page navigation without holding PHP session locks.
- **Spatie RBAC & Member Administration**:
  - Auto-bootstrapped **15 granular permissions** across 3 core roles (`superadmin`, `admin`, `member`) plus custom roles and an interactive permission matrix.
  - Master-Detail member directory (`MemberDetailPanel`), account suspend/ban with immediate active session revocation, portfolio preview, and 1-click promotion of member custom skills to the global catalog.
- **Technical SEO & Versioned Caching**:
  - Hybrid SSR Blade + client `SeoHead` OpenGraph, Twitter Card, hardened JSON-LD (`ProfilePage` + `Person`), `PreventIndexing` (`X-Robots-Tag`) on `/admin/*`, and cached dynamic `/sitemap.xml`.
  - Versioned portfolio cache keys (`portfolio:v{version}:user:{id}`) enabling `O(1)` global catalog cache invalidation (`bumpCatalogVersion()`) without `Cache::flush()`.
- **Dual-Theme Accessible Admin UI (WCAG 2.1 AA)**: Dark & Light Mode token architecture (`resources/css/admin/*.css`), HeadlessUI `<AdminModal>` dialogs/sheets with focus trap, and thumb-zone `<MobileFab>` navigation.

---

## Documentation Map (`docs/`)

Detailed end-to-end flows, database schemas, and audit reports are maintained in the [`docs/`](./docs/README.md) directory:

| Document | Description |
| :--- | :--- |
| [**`docs/README.md`**](./docs/README.md) | Master Index, actors & 15 RBAC permissions matrix, module map, and end-to-end system flowchart. |
| [**`docs/01-database-erd.md`**](./docs/01-database-erd.md) | Mermaid `erDiagram`, Eloquent models, column specifications, relationships, and pruning policies. |
| [**`docs/02-background-system.md`**](./docs/02-background-system.md) | Versioned caching, queued mail (`SendMailToMe`, `VerifyEmailLink`), SSE streaming, `LogService`, and daily scheduler pruning. |
| [**`docs/features/`**](./docs/features/) | 14 modular feature specifications: [`auth`](./docs/features/auth.md), [`dashboard-analytics`](./docs/features/dashboard-analytics.md), [`home-profile`](./docs/features/home-profile.md), [`projects`](./docs/features/projects.md), [`skills`](./docs/features/skills.md), [`experiences`](./docs/features/experiences.md), [`contacts`](./docs/features/contacts.md), [`members`](./docs/features/members.md), [`roles-and-permissions`](./docs/features/roles-and-permissions.md), [`platform-settings`](./docs/features/platform-settings.md), [`activity-logs`](./docs/features/activity-logs.md), [`notifications`](./docs/features/notifications.md), [`account-settings`](./docs/features/account-settings.md), [`public-portfolio`](./docs/features/public-portfolio.md). |

---

## Quick Start

### Prerequisites
- **PHP** >= 8.3 (`pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`)
- **Composer** >= 2.x
- **Node.js** >= 20.x & **NPM**
- **MySQL** / **MariaDB** (or SQLite)

### Installation

1. **Clone & install dependencies**
   ```bash
   git clone https://github.com/BrianYudhistira/Zeee-Hub.git
   cd Zeee-Hub
   composer install
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Update `DB_*`, `APP_NAME="ZeeFolio"`, `APP_URL`, and `MAIL_*` in `.env` as needed.

3. **Migrate, seed, and link storage**
   ```bash
   php artisan migrate --seed
   php artisan storage:link
   ```

4. **Start development server**
   ```bash
   composer run dev
   ```
   *(Runs `php artisan serve`, `php artisan queue:listen --tries=1`, `php artisan pail`, and `npm run dev` concurrently. Alternatively, run `php artisan serve` and `npm run dev` in separate terminals.)*

5. **Production build**
   ```bash
   npm run build
   php artisan optimize
   ```

---

## Default Seeded Accounts

| Role | Email | Password | Portfolio URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `brianyudhistira1@gmail.com` | `password` | `/brian-yudhistira` |
| **Member** | `sarah.chen@zeefolio.dev` | `password` | `/sarah-chen` |

---

## Project Structure

```text
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # 12 Admin & SSE controllers + ResolvesAdminPortfolio trait
│   │   │   └── Portfolio/      # Public PortfolioController (views, contact mail, sitemap)
│   │   ├── Middleware/         # HandleInertiaRequests, PreventIndexing, SecurityHeadersMiddleware
│   │   └── Requests/Auth/      # LoginRequest & RegisterRequest
│   ├── Mail/                   # Queued Mailables (SendMailToMe, VerifyEmailLink)
│   ├── Models/                 # 14 Eloquent models (MassPrunable logs, notifications, views)
│   └── Services/               # PortfolioService, SeoService, RolePermissionService, LogService, AuthService
├── config/                     # App, permission, & Ziggy public/auth route groups
├── database/                   # Migrations, factories, & seeders
├── docs/                       # Modular architecture, ERD, background system, & 14 feature docs
├── resources/
│   ├── css/
│   │   ├── app.css             # Global base, fonts, & root scrollbars
│   │   └── admin/              # Modular admin CSS (tokens, shell, components, overrides)
│   ├── js/
│   │   ├── Components/         # Admin (modular sections/modals), Portfolio, SEO, & Shared UI
│   │   ├── Hooks/              # useAdminTheme (dark/light sync across portals)
│   │   ├── Layouts/            # Persistent AdminLayout & AdminAuthLayout
│   │   ├── Pages/              # Inertia pages (Admin/*, Portfolio/*, Error.jsx)
│   │   └── Utils/              # dateHelpers, memberHelpers, permissionHelpers, roleHelpers, notify
│   └── views/                  # Root Inertia & SSR SEO template (app.blade.php) & email views
└── routes/
    ├── console.php             # Daily model:prune scheduler
    ├── web.php                 # Root entry point
    └── web/                    # Modular routes (auth.php, portfolio.php, dashboard/*)
```

---

## Routes & RBAC Permissions Summary

- **Public Routes**:
  - `GET /{slug}` — Public portfolio landing page
  - `GET /{slug}/projects` — Public projects archive
  - `GET /{slug}/projects/{projectSlug}` — Public project detail & showcase gallery
  - `POST /{slug}/messageMe` — Public contact form submission (`throttle:5,1`)
  - `GET /sitemap.xml` — Cached dynamic XML sitemap for indexable portfolios
  - `GET /verify-email/{id}/{hash}` — Signed email verification endpoint (`signed`)
- **Admin Panel (`/admin/*`)** — Protected by `PreventIndexing`, `auth`, and Spatie `permission:*` middleware (**15 default permissions**):
  - **Portfolio Group (6)**: `dashboard.view`, `home.manage`, `projects.manage`, `skills.manage`, `experiences.manage`, `contacts.manage`
  - **Administration Group (7)**: `members.view`, `members.create`, `members.edit`, `members.delete`, `skills.promote`, `logs.view`, `settings.manage`
  - **Access Control Group (2)**: `roles.manage`, `permissions.manage`

---

## Testing & Maintenance

- **Run automated test suite (37 feature & unit tests)**:
  ```bash
  composer test
  # or
  php artisan test
  ```
- **Run scheduled pruning manually (`logs` > 180d, `user_notifications` > 90d, `portfolio_views` > 366d)**:
  ```bash
  php artisan model:prune
  ```
- **Broken `/storage/...` images or CVs**:
  ```bash
  php artisan storage:link
  ```
- **Reset RBAC & application caches**:
  ```bash
  php artisan permission:cache-reset
  php artisan optimize:clear
  ```

---

## License

Licensed under the [MIT License](https://opensource.org/licenses/MIT).
