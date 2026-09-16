---
name: zero-bench-dev
description: >-
  Development runbook and architectural standards for the BenchZero ESN ERP platform.
  Use when creating new DDD feature domains, atomic widgets, components, or signal stores.
---

# BenchZero Development Guide

BenchZero is an enterprise resource planning and inter-contrat risk management application built with Angular 21 (Zoneless + SSR), Tailwind CSS, and native Signals.

## 1. Architectural Principles

- **No Third-Party Component Suites:** Do not add heavy component libraries (e.g. Angular Material, PrimeNG). Build atomic, accessible, and theme-adaptive components using Tailwind CSS and native Angular standalone features.
- **Strict Separation of Concerns:**
  - `src/app/core/components/`: Global shared layout components (`sidebar`, `header`, `breadcrumbs`, `layout`).
  - `src/app/core/widgets/`: Domain-specific reusable isolated widgets (`lang-selector`, `theme-toggle`, `status-badge`, `stat-card`, `ai-sparkle-card`, `data-table-container`).
  - `src/app/core/stores/`: Global reactive state stores using native Angular Signals (`ThemeStore`, `LanguageStore`, `NavigationStore`).
  - `src/app/features/<domain>/`: Bounded contexts following Domain-Driven Design (DDD).
- **Zoneless & SSR Native:**
  - Always verify that new signal stores and components are SSR-safe (`isPlatformBrowser(this.platformId)` before accessing `window`, `document`, or `localStorage`).
  - Use `provideZonelessChangeDetection()` in `app.config.ts`.

## 2. Design System Tokens (Stitch)

- **Colors:**
  - Background Base: Light `#F8F9FF` (`bg-surface-bright`), Dark `#0B1120` (`dark:bg-slate-950`).
  - Cards & Containers: White (`bg-surface-container-lowest`), Dark `#0F172A` (`dark:bg-slate-900`).
  - Brand Primary: Deep Slate `#0F172A`.
  - Brand Secondary (Action): Electric Blue `#0058BE` (`bg-secondary-blue`).
  - Intelligence / AI Layer: Indigo `#6366F1` (`text-indigo-600`, glassmorphism with 12px blur).
- **Semantic Status Badges:**
  - `on_bench`: Urgent Red `#EF4444` (`bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400`).
  - `on_mission`: Emerald Green `#10B981` (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400`).
  - `ending_soon`: Amber `#F59E0B` (`bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400`).

## 3. Adding a New DDD Feature

1. Create feature directory inside `src/app/features/<feature-name>/`.
2. Implement standalone component using atomic widgets from `src/app/core/widgets/`.
3. Add route configuration in `src/app/app.routes.ts` with lazy `loadComponent()`.
4. Register navigation item in `src/app/core/components/sidebar/sidebar.component.ts` and translation keys in `src/app/core/stores/language.store.ts`.
5. Run `npm run build` and `npx ng test --watch=false` to verify.
