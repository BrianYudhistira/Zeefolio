[← Back to Index](./README.md)

# Database Entity Relationship Diagram (ERD) & Model Schema

This document maps all database tables, Eloquent models in `app/Models/`, relationships, cascade/restrict rules, and automated retention policies (*pruning*) based on the migrations in `database/migrations/`.

---

## 1. Mermaid `erDiagram`

```mermaid
erDiagram
    USERS ||--o| PORTFOLIO_USERS : "hasOne (user_id)"
    USERS ||--o{ LOGS : "hasMany (user_id)"
    USERS ||--o{ USER_NOTIFICATIONS : "recipient (user_id)"
    USERS ||--o{ USER_NOTIFICATIONS : "actor (actor_id)"
    USERS ||--o{ TECH_STACKS : "custom owner (user_id)"
    USERS ||--o{ TECH_STACK_CATEGORIES : "custom owner (user_id)"
    USERS ||--o{ PROJECT_CATEGORIES : "custom owner (user_id)"

    PORTFOLIO_USERS ||--o| HOME : "hasOne (portfolio_user_id)"
    PORTFOLIO_USERS ||--o| CONTACTS : "hasOne (portfolio_user_id)"
    PORTFOLIO_USERS ||--o{ PROJECTS : "hasMany (portfolio_user_id)"
    PORTFOLIO_USERS ||--o{ EXPERIENCES : "hasMany (portfolio_user_id)"
    PORTFOLIO_USERS ||--o{ USER_SKILLS : "hasMany (portfolio_user_id)"
    PORTFOLIO_USERS ||--o{ PORTFOLIO_VIEWS : "hasMany (portfolio_user_id)"

    PROJECTS ||--o{ PROJECT_IMAGES : "hasMany (project_id)"
    PROJECTS }o--o{ TECH_STACKS : "project_tech_stack"
    PROJECTS ||--o{ PORTFOLIO_VIEWS : "hasMany (project_id)"

    TECH_STACK_CATEGORIES ||--o{ TECH_STACKS : "hasMany (category_id)"
    TECH_STACKS ||--o{ USER_SKILLS : "hasMany (tech_stack_id)"

    ROLES }o--o{ PERMISSIONS : "role_has_permissions"
    USERS }o--o{ ROLES : "model_has_roles"
    USERS }o--o{ PERMISSIONS : "model_has_permissions"

    USERS {
        bigint id PK
        string name
        string username UK
        string email UK
        string photo_path
        string role "superadmin | admin | member | custom"
        enum status "active | dnd | banned"
        string bio
        timestamp email_verified_at
        string password
        timestamp last_login_at
        string ip_address
        string location
        string remember_token
        timestamps created_at_updated_at
    }

    PORTFOLIO_USERS {
        bigint id PK
        bigint user_id FK
        json sections
        json skill_categories "1..4 category IDs"
        string theme
        string slug UK
        boolean is_active
        timestamps created_at_updated_at
    }

    HOME {
        bigint id PK
        bigint portfolio_user_id FK
        string greeting
        string name
        json passions
        text description
        string logo_path
        string image_path
        string cv_path
        json social_media_links
        timestamps created_at_updated_at
    }

    CONTACTS {
        bigint id PK
        bigint portfolio_user_id FK
        string email
        string phone
        text address
        timestamps created_at_updated_at
    }

    PROJECTS {
        bigint id PK
        bigint portfolio_user_id FK
        string type
        string title
        string slug UK
        string project_type "matches project_categories.slug"
        text description
        text image_path
        string demo_url
        string source_url
        json tech_stack
        int sort_order
        boolean is_featured
        boolean is_active
        timestamps created_at_updated_at
    }

    PROJECT_IMAGES {
        bigint id PK
        bigint project_id FK
        string title
        text description
        json image_path "array of storage paths"
        timestamps created_at_updated_at
    }

    PROJECT_CATEGORIES {
        bigint id PK
        string name
        string slug
        boolean is_global
        bigint user_id FK "nullable"
        timestamps created_at_updated_at
    }

    TECH_STACK_CATEGORIES {
        bigint id PK
        string name
        bigint user_id FK "nullable"
        boolean is_global
        timestamps created_at_updated_at
    }

    TECH_STACKS {
        bigint id PK
        string name
        string icon
        bigint category_id FK "nullable"
        bigint user_id FK "nullable"
        boolean is_global
        timestamps created_at_updated_at
    }

    USER_SKILLS {
        bigint id PK
        bigint portfolio_user_id FK
        bigint tech_stack_id FK
        tinyint proficiency_level "1..5"
        timestamps created_at_updated_at
    }

    EXPERIENCES {
        bigint id PK
        bigint portfolio_user_id FK
        string company
        string position
        date start_date
        date end_date "nullable"
        text description
        string certificate_path "nullable"
        string tech_stack "comma-separated names"
        int sort_order
        timestamps created_at_updated_at
    }

    PORTFOLIO_VIEWS {
        bigint id PK
        bigint portfolio_user_id FK
        string page "home | projects | project"
        bigint project_id FK "nullable"
        string ip_hash "SHA-256(ip|app.key)"
        string user_agent
        timestamp viewed_at
    }

    LOGS {
        bigint id PK
        bigint user_id FK "nullable"
        string ip_address
        string location
        string user_agent
        text message
        enum type "emergency..debug | admin"
        string module
        timestamps created_at_updated_at
    }

    USER_NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        bigint actor_id FK "nullable"
        string module
        string type
        string title
        text message
        string action_url
        boolean is_popup_hidden
        timestamp read_at "nullable"
        timestamp deleted_at "SoftDeletes"
        timestamps created_at_updated_at
    }
```

---

## 2. Entity & Eloquent Model Specifications

### <a id="users"></a>2.1. `users` (`App\Models\User`)
- **Business Purpose:** Stores account credentials, profile identity, suspension state (`active`, `dnd`, `banned`), active role name, and last login telemetry.
- **Contracts & Traits:** `Authenticatable`, `MustVerifyEmail`, `HasFactory`, `Notifiable`, `Spatie\Permission\Traits\HasRoles`.
- **Appended Accessor:** `photo_url` (resolves relative `photo_path` into a public `asset('storage/...')` URL).
- **Relationships:**
  - `portfolioUser()` → `HasOne(PortfolioUser::class)` (`cascadeOnDelete`).
  - `logs()` → `HasMany(Log::class)` (`nullOnDelete`).
  - `roles()` & `permissions()` → Spatie polymorphic relations (`model_has_roles`, `model_has_permissions`).
- **Referenced By:** [Authentication](./features/auth.md), [Account Settings](./features/account-settings.md), [Members & Accounts](./features/members.md), [Roles & Permissions](./features/roles-and-permissions.md).

### <a id="portfolio-users"></a>2.2. `portfolio_users` (`App\Models\PortfolioUser`)
- **Business Purpose:** Root portfolio record owned by a `User`. Controls public visibility (`is_active`), canonical URL (`slug`), theme, and the selected display skill category IDs (`skill_categories`, max 4).
- **Key Constant:** `RESERVED_SLUGS` (`admin`, `api`, `storage`, `sanctum`, `up`, `_boost`, `verify-email`, `messageMe`, `projects`, `me`, `v2`, `sitemap`, `sitemap.xml`) prevents user slugs from colliding with system routes.
- **Casts:** `sections => array`, `skill_categories => array`, `is_active => boolean`.
- **Relationships:**
  - `user()` → `BelongsTo(User::class)`
  - `home()` → `HasOne(Home::class)`
  - `contacts()` → `HasOne(Contact::class)`
  - `projects()` / `featuredProjects()` → `HasMany(Project::class)`
  - `experiences()` → `HasMany(Experience::class)` (ordered by `orderByDesc('start_date')->orderByDesc('id')`)
  - `userSkills()` → `HasMany(UserSkills::class)`
  - `views()` → `HasMany(PortfolioView::class)`
- **Referenced By:** [Home & Profile](./features/home-profile.md), [Skills](./features/skills.md), [Dashboard & Analytics](./features/dashboard-analytics.md), [Public Portfolio](./features/public-portfolio.md).

### <a id="home"></a>2.3. `home` (`App\Models\Home`)
- **Business Purpose:** Stores the portfolio Hero & Bio section (unifying the `home` and legacy `about` data).
- **Key Columns:** `greeting`, `name`, `passions` (JSON array), `description` (requires at least 50 characters to pass `HomeController@update` validation and `SeoService` indexability checks), `logo_path`, `image_path`, `cv_path`, `social_media_links` (JSON object: `github`, `linkedin`, `instagram`, `website`).
- **Appended Accessors:** `logo_url`, `image_url`, `cv_url`.
- **Referenced By:** [Home & Profile](./features/home-profile.md), [Public Portfolio & SEO](./features/public-portfolio.md).

### <a id="contacts"></a>2.4. `contacts` (`App\Models\Contact`)
- **Business Purpose:** Stores public portfolio contact details (`email`, `phone`, `address`). The `email` column serves as the primary recipient address when visitors submit the public contact form.
- **Referenced By:** [Contacts](./features/contacts.md), [Public Portfolio](./features/public-portfolio.md#public-contact-form-submission).

### <a id="projects"></a>2.5. `projects` (`App\Models\Project`) & `project_tech_stack`
- **Business Purpose:** Stores portfolio projects owned by a `PortfolioUser`.
- **Key Columns:** `title`, `slug` (globally unique), `type` (`personal` default), `project_type` (matches `project_categories.slug`), `description`, `image_path` (cover image with anti-double-encoding normalization via `normalizeImagePath()`), `demo_url`, `source_url`, `tech_stack` (JSON array snapshot of tech stack names), `sort_order`, `is_featured`, `is_active`.
- **Relationships:**
  - `portfolioUser()` → `BelongsTo(PortfolioUser::class)`
  - `techStacks()` → `BelongsToMany(TechStack::class, 'project_tech_stack')->withPivot('sort_order')->orderByPivot('sort_order')`
  - `images()` → `HasMany(ProjectImage::class)`
- **Referenced By:** [Projects & Showcase](./features/projects.md), [Public Portfolio](./features/public-portfolio.md).

### <a id="project-images"></a>2.6. `project_images` (`App\Models\ProjectImage`)
- **Business Purpose:** Stores gallery showcase blocks for a project. Each record has a `title`, `description`, and `image_path` (a JSON array holding multiple screenshot storage paths).
- **Appended Accessor:** `image_url` (maps every path in `image_path` to its public URL).
- **Referenced By:** [Projects & Showcase](./features/projects.md#showcase-gallery-synchronization).

### <a id="project-categories"></a>2.7. `project_categories` (`App\Models\ProjectCategory`)
- **Business Purpose:** Hybrid-scoped project category catalog:
  - **Global Default (`is_global = true`, `user_id = null`):** Managed by Admins in [Platform Settings](./features/platform-settings.md) and shared across all users.
  - **User Custom (`is_global = false`, `user_id = <id>`):** Managed by individual portfolio owners in [Projects](./features/projects.md#per-user-custom-project-categories).
- **Eloquent Scopes:** `scopeGlobal()`, `scopeAvailableFor(?User $user)`.

### <a id="tech-stack-categories"></a>2.8. `tech_stack_categories` (`App\Models\TechStackCategory`)
- **Business Purpose:** Hybrid-scoped skill category catalog (user scoping added in migration `2026_11_17_000001`):
  - **Global Default (`is_global = true`, `user_id = null`):** Managed via [Platform Settings](./features/platform-settings.md) or promoted via [Members](./features/members.md#promoting-member-custom-skills-to-global-catalog).
  - **User Custom (`is_global = false`, `user_id = <id>`):** Managed by portfolio owners via [Skills](./features/skills.md#per-user-custom-skill-categories).
- **Helpers & Scopes:** `scopeGlobal()`, `scopeAvailableFor(?User $user)`, `availableExistsRule(?User $user)`, `findOrCreateForUser()`.

### <a id="tech-stacks"></a>2.9. `tech_stacks` (`App\Models\TechStack`)
- **Business Purpose:** Master technology/skill catalog (`name`, Devicon class `icon`, `category_id`, `user_id`, `is_global`).
- **Ownership Rules:**
  - Global skills (`is_global = true`, `user_id = null`) are selectable by all users.
  - Custom skills (`is_global = false`, `user_id = <id>`) are private to their creator until promoted by an Admin via [Members](./features/members.md#promoting-member-custom-skills-to-global-catalog).
  - When a user deletes a custom skill from `user_skills` and it is no longer attached to any project, the underlying custom `TechStack` row is automatically cleaned up (`SkillController@destroy`).

### <a id="user-skills"></a>2.10. `user_skills` (`App\Models\UserSkills`)
- **Business Purpose:** Links a `PortfolioUser` to an active `TechStack` with a proficiency rating (`proficiency_level` `1` to `5`: *Beginner*, *Elementary*, *Intermediate*, *Advanced*, *Expert*).
- **Constraint:** Composite `(portfolio_user_id, tech_stack_id)` uniqueness is enforced by application validation and composite indexing.
- **Referenced By:** [Skills](./features/skills.md), [Experiences](./features/experiences.md), [Public Portfolio](./features/public-portfolio.md).

### <a id="experiences"></a>2.11. `experiences` (`App\Models\Experience`)
- **Business Purpose:** Stores career and work experience entries (`company`, `position`, `start_date`, `end_date`, `description`, comma-separated skill names in `tech_stack`, and `sort_order`).
- **Icon Hydration:** When loaded through `PortfolioService`, the comma-separated `tech_stack` string is hydrated into `tech_stacks: [{ name, icon }]` using the user's available `TechStack` catalog.
- **Referenced By:** [Experiences](./features/experiences.md), [Public Portfolio](./features/public-portfolio.md).

### <a id="portfolio-views"></a>2.12. `portfolio_views` (`App\Models\PortfolioView`)
- **Business Purpose:** Records deduplicated public page visits (`page`: `home`, `projects`, `project`, nullable `project_id`, `ip_hash`, `user_agent`, `viewed_at`).
- **Data Retention (`MassPrunable`):** Retains 366 days of raw view events (`viewed_at <= now()->subDays(366)`).
- **Referenced By:** [Public Portfolio](./features/public-portfolio.md#deduplicated-visitor-view-tracking), [Dashboard & View Analytics](./features/dashboard-analytics.md), [Background System](./02-background-system.md#daily-pruning).

### <a id="logs"></a>2.13. `logs` (`App\Models\Log`)
- **Business Purpose:** Stores system and user audit trail records (`user_id`, `ip_address`, `location`, `user_agent`, `message`, `type`, `module`).
- **Log Types:** `info`, `admin`, `warning`, `error` (plus RFC 5424 levels `emergency` through `debug`).
- **Data Retention (`MassPrunable`):** Retains 180 days of logs (`created_at <= now()->subDays(180)`).
- **Referenced By:** [Activity Logs](./features/activity-logs.md), [Background System](./02-background-system.md#audit-and-notification-dispatch).

### <a id="user-notifications"></a>2.14. `user_notifications` (`App\Models\UserNotification`)
- **Business Purpose:** Dedicated per-user in-app notification inbox (`user_id` recipient, `actor_id` actor, `module`, `type`, `title`, `message`, `action_url`, `is_popup_hidden`, `read_at`, `deleted_at`).
- **Traits:** `MassPrunable`, `SoftDeletes`.
- **Data Retention (`MassPrunable`):** Permanently purges records (including soft-deleted rows) older than 90 days (`created_at <= now()->subDays(90)`).
- **Referenced By:** [Notifications & SSE](./features/notifications.md), [Background System](./02-background-system.md#sse-stream).

### <a id="spatie-rbac"></a>2.15. Spatie Permission Tables (`roles`, `permissions`, `role_has_permissions`, `model_has_roles`, `model_has_permissions`)
- **Business Purpose:** Stores RBAC roles and permissions for `guard_name = 'web'`.
- **Custom Columns:** `roles` includes `description`; `permissions` includes `group` and `description`.
- **Referenced By:** [Roles & Permissions](./features/roles-and-permissions.md).

---

## 3. <a id="legacy-tables"></a>Infrastructure & Legacy Migration Tables Note

1. **Laravel Infrastructure Tables (`0001_01_01_*`):**
   - `sessions`: Stores active web sessions (`user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`). Queried directly by [Members](./features/members.md#updating-accounts-changing-roles--suspendban-session-revocation) to revoke active sessions immediately when an account is banned or deleted.
   - `cache` & `cache_locks`: Backing store for versioned portfolio cache keys, XML sitemap cache, and view deduplication locks.
   - `jobs`, `job_batches`, `failed_jobs`: Database queue tables processing asynchronous emails ([Background System](./02-background-system.md#queued-mail)).
2. **Inactive Legacy Migration Tables:**
   - `settings` (`2025_11_15_000001_create_settings_table.php`), `balance_track` (`2026_01_02_000001_create_balance_track_table.php`), and `personal_access_tokens` (`2025_10_15_163752_create_personal_access_tokens_table.php`) exist in migration history but are not used by any active Eloquent Model or Controller.
