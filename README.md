# ⚡ BenchZero — ESN Operations & Inter-contrat Intelligence Suite

**BenchZero** is a next-generation Enterprise Resource Planning (ERP) platform engineered specifically for ESNs (Digital Services Companies / Entreprises de Services Numériques). It minimizes consultant bench (inter-contrat) periods, monitors daily financial exposure, visualizes skills gap heatmaps, and accelerates RFP staffing with AI-powered pitch generation.

Designed in alignment with the [Stitch Design System (Project 15147121731840790718)](https://stitch.withgoogle.com/u/1/projects/15147121731840790718?pli=1).

---

## 🏛️ Architectural Foundations

- **Framework:** Angular 21 (LTS) Standalone
- **Change Detection:** Zoneless (`provideZonelessChangeDetection()`) — zero `zone.js` runtime overhead
- **Rendering:** Angular SSR (`@angular/ssr`) with static route prerendering
- **State Management:** `@ngrx/signals` SignalStores (Zoneless native, `withState`, `withComputed`, `withMethods`)
- **Mock Architecture:** Zero mock overhead in `src/` — external Express server (`mock-server/`) + CLI reverse proxy (`proxy.conf.json`)
- **Styling:** Tailwind CSS v4 with custom Stitch design tokens and full dark/light theme adaptability
- **Component Architecture:** Domain-Driven Design (DDD) with strict layer hierarchy and externalized models
- **Zero Third-Party UI Libs:** 100% bespoke, high-performance atomic components and widgets

---

## 📂 Project Architecture

```
src/app/
├── core/
│   ├── components/              # Global shared layout utilities
│   │   ├── sidebar/             # Responsive navigation with Stitch categories
│   │   ├── header/              # Search, notifications, widgets, and user avatar
│   │   ├── breadcrumbs/         # Dynamic route-aware breadcrumbs
│   │   └── layout/              # Unified application shell
│   │
│   ├── widgets/                 # Isolated domain-specific reusable widgets
│   │   ├── modal/               # Native <dialog> modal (focus trap, Escape, backdrop, scroll lock)
│   │   ├── avatar/              # Initials avatar with stable colour
│   │   ├── error-state/         # Error banner with retry
│   │   ├── notifications-menu/  # Header notifications dropdown (mark read / all read)
│   │   ├── skeleton/            # Skeleton placeholders + <tbody appSkeletonRows> for tables
│   │   ├── toast/               # Toast stack (top-layer popover, visible above modals)
│   │   ├── loading-bar/         # HTTP loading indicator
│   │   ├── lang-selector/       # Multi-language selector (EN/FR) with Signals
│   │   ├── theme-toggle/        # Dark/Light mode toggle
│   │   ├── status-badge/        # Semantic status chips (Bench, Mission, Ending)
│   │   ├── stat-card/           # KPI metric card with trends, tones, and progress
│   │   ├── ai-sparkle-card/     # Glassmorphic AI match layer
│   │   └── data-table/          # Table container with Compact/Comfortable density
│   │
│   ├── stores/                  # Global reactive signal stores (SSR-safe)
│   │   ├── theme.store.ts       # Theme mode state, localStorage sync, DOM class
│   │   ├── language.store.ts    # Locale state & reactive translation dictionary
│   │   ├── navigation.store.ts  # Sidebar / drawer state and live sidebar badges
│   │   ├── notifications.store.ts
│   │   └── session.store.ts     # Current user profile
│   │
│   ├── services/                # Toast, loading, CSV export & clipboard, workspace API
│   ├── utils/                   # toErrorMessage, injectIsBrowser
│   └── models/                  # Global system contracts (theme, language, navigation, toast, notification, session)
│
└── features/                    # DDD Bounded Contexts
    ├── bench-risk/              # Dashboard: live exposure KPIs, period trends, AI recommendation, CSV export
    ├── skills-gap/              # Supply × demand heatmap, category coverage, upskilling suggestions
    ├── placements/              # Drag & drop kanban (5 stages), create / edit / delete opportunities
    ├── pitch-generator/         # EN/FR pitch generation, copy, email, save to pipeline
    ├── consultants/             # Directory with sort/filter/export, profile modal, create/edit form
    ├── customers/               # Accounts, staffing, RFPs with suggested consultants
    └── design-system/           # Design System & Component Showcase
```

### URL-driven modals & deep links

Modals are driven by query params so every view is shareable and the back button closes them:

| URL | Opens |
| :--- | :--- |
| `/consultants?id=5` · `?id=5&mode=edit` · `?mode=new` · `?q=kafka` | Profile · edit form · creation form · search |
| `/clients?id=c1` · `?mode=new` | Account detail (staffing, RFPs, suggested consultants) · creation form |
| `/placements?id=p1` · `?mode=new&consultantId=1&clientId=c1&rfpId=r1` | Opportunity detail · prefilled creation form |
| `/pitch-generator?consultantId=1&clientId=c1&rfpId=r1` | Prefilled pitch generator |
| `/skills-gap?skill=kubernetes` | Skill detail |

### Mock API (`mock-server/`, port 3001)

In-memory datastore cloned from `mock-server/data/*.json` (seeds are never modified; `POST /api/__reset` restores them). Latency is simulated with `MOCK_LATENCY` (default 250 ms).

| Domain | Endpoints |
| :--- | :--- |
| Consultants | `GET /api/consultants` (`status`, `search`, `skill`) · `GET/PUT/DELETE /api/consultants/:id` · `POST /api/consultants` |
| Clients | `GET /api/clients` · `GET /api/clients/:id` (staffing, RFPs, suggestions) · `POST /api/clients` · `PUT /api/clients/:id` · `POST /api/clients/:id/rfps` |
| Placements | `GET/POST /api/placements` · `PATCH/DELETE /api/placements/:id` (signing puts the consultant on mission) |
| Analytics | `GET /api/risk/overview?period=month\|quarter\|year` · `GET /api/skills-gap` · `POST /api/pitch/generate` |
| Workspace | `GET /api/me` · `GET /api/navigation/badges` · `GET /api/notifications` · `PATCH /api/notifications/:id/read` · `POST /api/notifications/read-all` · `GET /api/health` |

---

## 🎨 Design System & Styling Tokens

| Token | Light Mode | Dark Mode | Role |
| :--- | :--- | :--- | :--- |
| **Surface Base** | `#F8F9FF` | `#0B1120` | Application background |
| **Surface Card** | `#FFFFFF` | `#0F172A` | Cards, sidebars, headers |
| **Primary Navy** | `#0F172A` | `#F8FAFC` | Core branding & headlines |
| **Secondary Blue** | `#0058BE` | `#3B82F6` | Primary actions & active tabs |
| **AI Layer** | `#6366F1` | `#818CF8` | Glassmorphism & recommendations |
| **On Bench** | `#EF4444` | `#F87171` | High financial risk indicator |
| **On Mission** | `#10B981` | `#34D399` | Revenue-generating active contract |
| **Ending Soon** | `#F59E0B` | `#FBBF24` | Contract ending within 30 days |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Installation
```bash
# Install dependencies
npm install
```

### Development Server
```bash
# Run local dev server
npm start
# Navigate to http://localhost:4200
```

### Production Build & SSR
```bash
# Build client and server bundles with prerendered static routes
npm run build

# Run Node.js SSR production server
npm run serve:ssr:zero-bench
```

### Unit Tests
```bash
# Run tests with Vitest
npx ng test --watch=false
```

---

## 🌐 Production Deployment

Automated server deployment is orchestrated via `deploy.sh`:

```bash
./deploy.sh
```

- **Target Node:** `79.137.14.75`
- **Authentication:** SSH Public Key (`~/.ssh/id_rsa`)
- **Safety:** Multi-tenant isolated payload rsync to target root without disrupting sibling sites.

---

## 🤖 AI Agent Customizations

This repository includes custom agent skills and rules:
- `.agents/skills/zero-bench-dev/SKILL.md`: Runbook for adding DDD features and components.
- `.agents/rules/architecture.md`: Architectural guidelines enforcing clean code and zoneless reactivity.
