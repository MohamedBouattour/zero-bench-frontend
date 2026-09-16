# BenchZero Architectural Rules & Standards

## 1. Component First Hierarchy
- Global layout elements strictly live inside `src/app/core/components/`.
- Domain-specific reusable widgets strictly live inside `src/app/core/widgets/`.
- Bounded contexts live inside `src/app/features/<domain>/`.

## 2. State Management with Signals
- Use native Angular Signals (`signal`, `computed`, `effect`) for all reactive state.
- Do not import external state management libraries (e.g. NgRx store/effects) unless explicitly mandated.
- Stores must be SSR-safe: check `isPlatformBrowser(inject(PLATFORM_ID))` before touching browser APIs.

## 3. Dark Theme & Accessibility
- All components and widgets must natively support both light and dark mode classes (`dark:` prefix in Tailwind).
- Ensure semantic HTML tags (`<nav>`, `<header>`, `<main>`, `<aside>`, `<button>`) and ARIA labels.

## 4. Zero Mock Overhead
- Dynamic data models must be typed via TypeScript interfaces in `src/app/core/models/`.
- Relational tables and views must support clean pagination and density toggles.
