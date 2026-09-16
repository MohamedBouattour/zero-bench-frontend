---
name: zero-bench-dev
description: >-
  Comprehensive development runbook and architectural standards for the BenchZero ESN ERP platform.
  Use when planning features, domain modeling, scaffolding DDD domains, declaring externalized models,
  writing NgRx SignalStores, creating atomic widgets, configuring mock REST endpoints and reverse proxy,
  or executing automated verification and deployment pipelines.
---

# ⚡ BenchZero Architecture & Development Runbook

**BenchZero** is an enterprise resource planning and inter-contrat risk management platform engineered for ESNs (Digital Services Companies). It is built with **Angular 21 LTS** (Zoneless + SSR), **Tailwind CSS v4** (Stitch design tokens), **`@ngrx/signals`** (SignalStore), and an **external mock server architecture** with zero hardcoded mock data in `src/`.

---

## 👥 1. Autonomous Roles & Planning Pipeline

Development strictly follows the **Autonomous Development & Deployment Protocol**:

### Roles & Responsibilities
- 👑 **The Boss (Senior Architect & Tech Lead — Claude / Gemini):** Feature planning, domain modeling, system orchestration, design verification against Stitch tokens, and defining acceptance criteria.
- 🛠️ **The Employee (Execution Agent — `opencode` / `bigpickle`):** Code generation, unit testing, E2E test execution, CI/CD automation, and performance optimization.

### The Sequential Planning Loop
```
[Trigger] ➔ Create Plan File ➔ [Populate Markdown] ➔ Run opencode CLI ➔ Execute ➔ Review
```
1. **Enter Plan Mode:** Create a dedicated plan file in `plan/DD_MM_YYYY-HH_mm.md` (e.g. `plan/16_09_2026-23_05.md`).
2. **Populate Architecture:** Detail domain models, widget decomposition, mock payloads, and verification checklist.
3. **Execute via CLI:**
   ```bash
   opencode --context=plan/DD_MM_YYYY-HH_mm.md
   ```
4. **Architectural Review:** Verify strict typing, bundle size, and design fidelity.

> 📖 **Deep Dive:** [Autonomous Protocol Specification](./references/autonomous-protocol.md)

---

## 🏛️ 2. Component Hierarchy & Layer Isolation

BenchZero enforces a strict Component-First, Domain-Driven Design (DDD) isolation strategy:

| Layer | Path | Isolation Scope & Rules |
| :--- | :--- | :--- |
| **Global Layout Shells** | `src/app/core/components/` | Application-wide layout structures (`sidebar`, `header`, `breadcrumbs`, `layout`, `logo`). |
| **Atomic Domain Widgets** | `src/app/core/widgets/` | Isolated, reusable dumb widgets (`status-badge`, `stat-card`, `ai-sparkle-card`, `data-table-container`, `lang-selector`, `theme-toggle`). |
| **Global UI SignalStores** | `src/app/core/stores/` | Cross-cutting UI state (`ThemeStore`, `LanguageStore`, `NavigationStore`). 100% SSR-safe. |
| **Core Infrastructure Models** | `src/app/core/models/` | Reserved strictly for global system types (`theme`, `language`, `navigation`, `breadcrumb`). |
| **Domain Bounded Contexts** | `src/app/features/<domain>/` | Self-contained DDD feature modules (`bench-risk`, `consultants`, `customers`, `placements`, `skills-gap`, `pitch-generator`). |

> 📖 **Deep Dive:** [Layer Hierarchy & DDD Reference](./references/layer-hierarchy-ddd.md)

---

## 📐 3. DDD Feature Flow & Model Organization

Every domain feature under `src/app/features/<domain>/` MUST follow this standard subfolder flow:

```
src/app/features/<domain>/
├── models/
│   └── <domain>.model.ts         # Entities, DTOs, and *State interfaces (MANDATORY)
├── services/
│   └── <domain>-api.service.ts   # Injectable HttpClient service using API_BASE_URL token
├── stores/
│   └── <domain>.store.ts         # NgRx SignalStore (signalStore, withState, withMethods)
├── <domain>.component.ts         # Standalone smart/container component
└── <domain>.component.html       # (Optional if inline template)
```

### Critical Modeling Rules
- ⚠️ **Strict Prohibition of Inline State Interfaces:** Never declare `interface *State` inline in `.store.ts`. Always declare in `models/<domain>.model.ts` and import it.
- ⚠️ **Domain Encapsulation:** Feature entities (e.g. `Consultant`, `ClientAccount`, `RiskMetrics`) belong in their domain's `models/` directory, never directly in `src/app/core/models/`.

> 📋 **Templates:**
> - [Domain Model Example](./examples/domain.model.example.ts)
> - [Domain API Service Example](./examples/domain-api.service.example.ts)
> - [Domain SignalStore Example](./examples/domain.store.example.ts)

---

## ⚡ 4. Reactive State with NgRx SignalStore (`@ngrx/signals`)

Domain reactive state is managed via `@ngrx/signals` (`^21.1.1`):

- **Zoneless Native:** Produces pure Angular Signals (`items()`, `isLoading()`, `error()`) without `zone.js`.
- **Immutability:** Use `patchState(store, ...)` for all mutations.
- **Service Injection:** Inject domain API services inside `withMethods` via Angular's `inject()`.
- **SSR Safety:** Check `isPlatformBrowser(inject(PLATFORM_ID))` before touching any browser storage or window APIs.

> 📖 **Deep Dive:** [NgRx SignalStore Reference](./references/ngrx-signal-store.md)

---

## 🗄️ 5. Zero Mock Overhead & Reverse Proxy Protocol

Hardcoding static mock arrays inside `src/` runtime application files is **strictly forbidden**.

1. **Seed Datastore:** All mock JSON data resides outside `src/` in `mock-server/data/<domain>.json`.
2. **Mock REST Server:** Express server running on port `3001` via `mock-server/server.mjs`.
3. **Angular CLI Proxy:** `proxy.conf.json` maps `/api/*` to `http://localhost:3001`.
4. **Dual-Mode SSR:** In the browser, `API_BASE_URL` is `''` (relative proxy). In Node SSR, `API_BASE_URL` is `http://127.0.0.1:3001` (direct loopback).
5. **Zero-Code Production Cutover:** When migrating to the live backend, only update `proxy.conf.json` or Nginx upstream. **Zero lines of Angular code in `src/` change.**

> 📖 **Deep Dive:** [Zero Mock Proxy Architecture Reference](./references/zero-mock-proxy.md)

---

## 🎨 6. Stitch Design System Tokens

All visual elements conform to [Stitch Design System (Project 15147121731840790718)](https://stitch.withgoogle.com/u/1/projects/15147121731840790718?pli=1):

- **Surface Base:** Light `#F8F9FF` / Dark `#0B1120` (`dark:bg-slate-950`).
- **Surface Cards:** Light `#FFFFFF` / Dark `#0F172A` (`dark:bg-slate-900`).
- **Brand Navy:** `#0F172A` (Light) / `#F8FAFC` (Dark).
- **Secondary Blue:** `#0058BE` (Action CTA) / `#3B82F6` (Dark).
- **AI Sparkle Accent:** `#6366F1` with glassmorphic 12px blur.
- **Semantic Chips:**
  - `on_bench`: Red `#EF4444` (`bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400`).
  - `on_mission`: Emerald `#10B981` (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400`).
  - `ending_soon`: Amber `#F59E0B` (`bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400`).

> 📖 **Deep Dive:** [Stitch Design Tokens Reference](./references/stitch-tokens.md)

---

## 🌐 7. DevOps & Production Deployment Matrix

Production deployment is automated via `deploy.sh` with strict multi-tenant isolation:

- **Target Node:** `79.137.14.75`
- **Application Target Path:** `/var/www/zero-bench` (`/browser` and `/server`)
- **Authentication:** Strict SSH public key (`~/.ssh/id_rsa`). Passwords/tokens forbidden.
- **Multi-Tenant Safety:** Non-destructive rsync sync and Nginx reload preserving sibling sites.

> 📖 **Deep Dive:** [DevOps & Deployment Matrix Reference](./references/deployment-matrix.md)

---

## 🛠️ 8. Step-by-Step Feature Implementation Runbook

Follow this sequential workflow when implementing or extending any feature:

### Step 1: Feature Planning
Enter Plan Mode and create `plan/DD_MM_YYYY-HH_mm.md` detailing the feature boundaries and acceptance criteria.

### Step 2: Scaffold DDD Feature Domain
Run the automated scaffolding script:
```bash
./.agents/skills/zero-bench-dev/scripts/scaffold-domain.sh <domain-name>
```

### Step 3: Define Domain Models
Open `src/app/features/<domain>/models/<domain>.model.ts` and define all entity interfaces, DTOs, query filters, and the `<Domain>State` interface.

### Step 4: Seed Mock Data & Register Endpoints
1. Add realistic JSON seed data in `mock-server/data/<domain>.json`.
2. Register the REST route in `mock-server/server.mjs`.

### Step 5: Implement API Service & NgRx SignalStore
1. Implement `src/app/features/<domain>/services/<domain>-api.service.ts` using `HttpClient` and `API_BASE_URL`.
2. Implement `src/app/features/<domain>/stores/<domain>.store.ts` using `signalStore()`, `withState()`, `withComputed()`, and `withMethods()`.

### Step 6: Build UI Component
Assemble the standalone component using atomic widgets from `src/app/core/widgets/` (`app-stat-card`, `app-status-badge`, `app-data-table-container`, `app-ai-sparkle-card`).

### Step 7: Configure Route & Navigation
1. Register lazy route in `src/app/app.routes.ts`.
2. Add navigation item in `src/app/core/components/sidebar/sidebar.component.ts`.
3. Add multi-language labels in `src/app/core/stores/language.store.ts`.

### Step 8: Automated Verification
Run the verification script:
```bash
./.agents/skills/zero-bench-dev/scripts/verify.sh
```

### Step 9: Production Deployment
Deploy safely to the production node:
```bash
./deploy.sh
```
