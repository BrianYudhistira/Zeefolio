<div align="center">

# ZeeFolio

**Multi-User Developer Portfolio & Content Management Platform**

[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Spatie Permission](https://img.shields.io/badge/Spatie_RBAC-8.x-10B981?style=for-the-badge&logo=php&logoColor=white)](https://spatie.be/docs/laravel-permission)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

*A multi-user developer portfolio platform built with **Laravel 13**, **Inertia.js v2**, and **React 18**. Each user gets a customizable public portfolio under `/{slug}`, view analytics, and a role-based management dashboard.*

</div>

---

## Features

- **Multi-Tenant Public Portfolio (`/{slug}`)**: Dedicated landing page, projects archive (`/{slug}/projects`), and project detail gallery (`/{slug}/projects/{projectSlug}`) with draft/privacy mode and direct contact mailer.
- **Portfolio Builder (`/admin/*`)**: Manage hero profile, CV upload, 1–4 prioritized skill categories, custom tech stacks with Devicon icons, career/education timeline, and projects.
- **Analytics & Audit Logs**: Tracks portfolio views (`PortfolioView`) and administrative/security actions (`LogService`).
- **RBAC & Member Management**: Powered by **Spatie Laravel Permission** (`superadmin`, `admin`, `member`, and custom roles) with member management, portfolio preview, and global catalog promotion.
- **Transactional File Safety**: File uploads and old-asset cleanup run inside database transactions to prevent orphaned or broken storage states.

---

## Quick Start

### Prerequisites
- **PHP** >= 8.3 (`pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`)
- **Composer** >= 2.x
- **Node.js** >= 20.x & **NPM**
- **MySQL** / **MariaDB**

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
   Update `DB_*`, `APP_NAME="ZeeFolio"`, and `APP_URL` in `.env` as needed.

3. **Migrate, seed, and link storage**
   ```bash
   php artisan migrate --seed
   php artisan storage:link
   ```

4. **Start development server**
   ```bash
   composer run dev
   ```
   *(Runs `php artisan serve`, queue listener, Pail logs, and Vite HMR concurrently. Alternatively, run `php artisan serve` and `npm run dev` separately.)*

5. **Production build**
   ```bash
   npm run build
   php artisan optimize
   ```

---

## Default Seeded Accounts

| Role | Email | Password | Portfolio Slug |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `brianyudhistira1@gmail.com` | `password` | `/brian-yudhistira` |
| **Member** | `sarah.chen@zeefolio.dev` | `password` | `/sarah-chen` |

---

## Project Structure

```text
├── app/
│   ├── Http/Controllers/   # Admin & Portfolio Inertia controllers
│   ├── Http/Middleware/     # HandleInertiaRequests & auth/permission middleware
│   ├── Models/             # Eloquent models
│   └── Services/           # PortfolioService (caching), AuthService, RolePermissionService, LogService
├── database/               # Migrations & seeders
├── resources/js/
│   ├── Components/         # Admin, Portfolio, Animations, & Shared UI components
│   ├── Layouts/            # AdminLayout
│   └── Pages/              # Inertia pages (Admin/*, Portfolio/*)
└── routes/web/             # Modular route files (auth, portfolio, dashboard/*)
```

---

## Routes & Access Control

- **Public**: `/{slug}`, `/{slug}/projects`, `/{slug}/projects/{projectSlug}`, `POST /{slug}/messageMe`
- **Dashboard (`/admin/*`)**: Protected by `auth` and Spatie `permission:*` middleware (`dashboard.view`, `profile.manage`, `projects.manage`, `skills.manage`, `experiences.manage`, `members.*`, `roles.manage`, `permissions.manage`, `settings.manage`).

---

## Testing & Troubleshooting

- **Run test suite**:
  ```bash
  composer test
  ```
- **Broken `/storage/...` images/CVs**: Run `php artisan storage:link` and check `storage/app/public` permissions.
- **Stale RBAC permissions**:
  ```bash
  php artisan permission:cache-reset
  php artisan optimize:clear
  ```

---

## License

Licensed under the [MIT License](https://opensource.org/licenses/MIT).
