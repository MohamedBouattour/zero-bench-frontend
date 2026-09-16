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
│   │   ├── lang-selector/       # Multi-language selector (EN/FR) with Signals
│   │   ├── theme-toggle/        # Dark/Light mode toggle with smooth animation
│   │   ├── status-badge/        # High-contrast semantic status chips (Bench, Mission, Ending)
│   │   ├── stat-card/           # KPI metric card with trends, tones, and progress
│   │   ├── ai-sparkle-card/     # Glassmorphic AI match layer with 12px blur
│   │   └── data-table/          # Table container with Compact/Comfortable density
│   │
│   ├── stores/                  # Global reactive signal stores (SSR-safe)
│   │   ├── theme.store.ts       # Theme mode state, localStorage sync, DOM class
│   │   ├── language.store.ts    # Locale state & reactive translation dictionary
│   │   └── navigation.store.ts  # Sidebar, drawer, and mobile menu state
│   │
│   └── models/                  # Domain contracts and types
│       ├── consultant.model.ts  # Consultant profile, seniority, TJM, status
│       ├── language.model.ts    # Supported locales & translation interfaces
│       ├── navigation.model.ts  # Nav items and section definitions
│       └── theme.model.ts       # Theme types
│
└── features/                    # DDD Bounded Contexts
    ├── bench-risk/              # Dashboard: Financial exposure, bench duration KPIs
    ├── skills-gap/              # Skills Gap Heatmap & demand forecasting
    ├── placements/              # Placement Pipeline (Kanban / Funnel stages)
    ├── pitch-generator/         # AI Pitch Generator for RFP matching
    ├── consultants/             # Consultant Management & CRUD Directory
    ├── customers/               # Clients & Mission Accounts Management
    └── design-system/           # Design System & Component Showcase
```

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
