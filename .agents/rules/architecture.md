# BenchZero Architectural Rules & Standards

## 1. Autonomous Planning & Execution Pipeline
- Major features and architecture changes strictly require entering **Plan Mode**.
- Create a dedicated plan file under `plan/DD_MM_YYYY-HH_mm.md` (e.g., `plan/16_09_2026-23_05.md`).
- Execution is orchestrated via: `opencode --context=plan/DD_MM_YYYY-HH_mm.md`.
- Strict division of responsibilities: The Boss (Claude/Gemini) architects and verifies; The Employee (opencode/bigpickle) executes code, tests, and CI/CD.

## 2. Component First Hierarchy
- Global layout elements strictly live inside `src/app/core/components/` (`sidebar`, `header`, `breadcrumbs`, `layout`, `logo`).
- Domain-specific reusable widgets strictly live inside `src/app/core/widgets/` (`status-badge`, `stat-card`, `ai-sparkle-card`, `data-table-container`, `lang-selector`, `theme-toggle`).
- Bounded contexts live inside `src/app/features/<domain>/`.

## 3. Domain-Driven Design (DDD) Model Flow
- Feature entities, DTOs, query filters, and state interfaces must live in `src/app/features/<domain>/models/<domain>.model.ts`.
- Inline `interface *State` declarations in store files are strictly prohibited.
- `src/app/core/models/` is reserved exclusively for global shared system contracts (`theme`, `language`, `navigation`, `breadcrumb`).

## 4. State Management with NgRx SignalStore
- Domain reactive state must be managed via `@ngrx/signals` SignalStore (`signalStore`, `withState`, `withComputed`, `withMethods`, `patchState`).
- Domain API services must use `HttpClient` with the SSR-safe `API_BASE_URL` token.
- UI state stores in `src/app/core/stores/` must be SSR-safe: check `isPlatformBrowser(inject(PLATFORM_ID))` before accessing browser APIs.

## 5. Zero Mock Overhead Policy
- No hardcoded mock data objects or static arrays in `src/` runtime application files.
- All development mock data resides outside `src/` in `mock-server/data/*.json` and is served via `mock-server/server.mjs`.
- Angular dev server reverse-proxies `/api/*` to `http://localhost:3001` via `proxy.conf.json`.
- Production backend migration is accomplished purely by re-targeting `proxy.conf.json` or Nginx reverse proxy without touching Angular application source code.

## 6. Dark Theme & Accessibility
- All components and widgets must natively support both light and dark mode classes (`dark:` prefix in Tailwind).
- Ensure semantic HTML tags (`<nav>`, `<header>`, `<main>`, `<aside>`, `<button>`) and ARIA labels.

## 7. DevOps & Production Deployment Matrix
- Deployment is orchestrated via `./deploy.sh` to production host `79.137.14.75` at `/var/www/zero-bench`.
- Authentication must strictly use authorized SSH public key (`~/.ssh/id_rsa`).
- Non-destructive, multi-tenant safe rsync and graceful Nginx reload without sibling site regression.
