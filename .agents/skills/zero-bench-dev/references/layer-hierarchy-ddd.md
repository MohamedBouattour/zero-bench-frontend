# 📐 Layer Hierarchy & DDD Architectural Standards

BenchZero adopts a strict Component-First, Domain-Driven Design (DDD) isolation strategy to prevent layout regression, code drift, and cross-domain entanglement.

---

## 🏛️ 1. Architectural Layers & Boundaries

| Layer | Path | Isolation Scope & Rules |
| :--- | :--- | :--- |
| **Global Layout Shells** | `src/app/core/components/` | Application-wide layout structures: `sidebar`, `header`, `breadcrumbs`, `layout`, `logo`. Only imports core widgets and core stores. |
| **Atomic Domain Widgets** | `src/app/core/widgets/` | Isolated, reusable dumb/presentational widgets: `status-badge`, `stat-card`, `ai-sparkle-card`, `data-table-container`, `lang-selector`, `theme-toggle`. Zero domain business logic. |
| **Core UI SignalStores** | `src/app/core/stores/` | Cross-cutting UI state: `ThemeStore`, `LanguageStore`, `NavigationStore`. Must be 100% SSR-safe. |
| **Global Infrastructure Models** | `src/app/core/models/` | Reserved strictly for global system types: `theme.model.ts`, `language.model.ts`, `navigation.model.ts`, `breadcrumb.model.ts`. Feature models MUST NOT live here. |
| **Domain Bounded Contexts** | `src/app/features/<domain>/` | Self-contained DDD feature modules (`bench-risk`, `consultants`, `customers`, `placements`, `skills-gap`, `pitch-generator`, `design-system`). |

---

## 📂 2. Standard DDD Feature Directory Flow

Every domain feature under `src/app/features/<domain>/` MUST follow this exact structure:

```
src/app/features/<domain>/
├── models/
│   └── <domain>.model.ts         # Entities, DTOs, query filters, and <Domain>State (MANDATORY)
├── services/
│   └── <domain>-api.service.ts   # Injectable HttpClient service using API_BASE_URL token
├── stores/
│   └── <domain>.store.ts         # NgRx SignalStore (signalStore, withState, withMethods)
├── <domain>.component.ts         # Standalone smart/container component consuming signals
└── <domain>.component.html       # (Optional if component uses external template)
```

---

## ⚠️ 3. Critical Model Rules

1. **Mandatory Model Directory:** Every domain must have a `models/` directory.
2. **Strict Prohibition of Inline State Interfaces:**
   - ❌ **Forbidden:** Declaring `export interface ConsultantsState { ... }` inside `consultants.store.ts`.
   - ✅ **Mandatory:** Declare `ConsultantsState` inside `models/consultant.model.ts`, then import it into the store:
     ```typescript
     import { Consultant, ConsultantsState } from '../models/consultant.model';
     ```
3. **No Domain Entities in Core:** Feature entities (e.g., `Consultant`, `PlacementOpportunity`, `RiskMetrics`, `ClientAccount`) belong to their respective feature's `models/` directory, NEVER directly in `src/app/core/models/`. Core models may only re-export domain types for backward compatibility when widgets require them.
4. **Strict Typing:** All models must enforce strict typing with zero `any` types. Enums or string union literals must be used for finite status sets (e.g. `'on_bench' | 'on_mission' | 'ending_soon'`).
