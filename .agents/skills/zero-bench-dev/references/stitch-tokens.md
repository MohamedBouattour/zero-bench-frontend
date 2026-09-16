# 🎨 Stitch Design System Tokens & Theming Standards

BenchZero's visual layer conforms strictly to the [Stitch Design System (Project 15147121731840790718)](https://stitch.withgoogle.com/u/1/projects/15147121731840790718?pli=1).

---

## 🎨 1. Color Palette & Token Definitions

| Design Token | Light Mode Hex | Dark Mode Equivalent | Role & Purpose |
| :--- | :--- | :--- | :--- |
| **Surface Base** | `#F8F9FF` | `#0B1120` (`dark:bg-slate-950`) | Global page background |
| **Surface Cards** | `#FFFFFF` | `#0F172A` (`dark:bg-slate-900`) | Cards, sidebar, header, dropdowns |
| **Brand Primary** | `#0F172A` | `#F8FAFC` (`dark:text-slate-100`) | Typography, logos, active nav text |
| **Secondary Blue** | `#0058BE` | `#3B82F6` (`dark:bg-blue-600`) | Primary buttons, active state indicators |
| **AI Layer Accent** | `#6366F1` | `#818CF8` | Glassmorphic cards, match percentages, sparkles |
| **Status: On Bench** | `#EF4444` | `#F87171` | High financial exposure chip |
| **Status: On Mission** | `#10B981` | `#34D399` | Revenue-generating active contract chip |
| **Status: Ending Soon** | `#F59E0B` | `#FBBF24` | Contract ending within 30 days chip |

---

## 🌓 2. Dark Mode Implementation Rules

1. **Tailwind Class-Based Dark Mode:** Dark mode is activated via the `.dark` CSS class on `<html>`.
2. **Every Element Must Support Both Modes:**
   - Backgrounds: `bg-white dark:bg-slate-900`
   - Borders: `border-slate-200 dark:border-slate-800`
   - Primary Text: `text-slate-900 dark:text-slate-100`
   - Secondary Text: `text-slate-500 dark:text-slate-400`
   - Hover states: `hover:bg-slate-50 dark:hover:bg-slate-800/60`
3. **No Hardcoded Hex in Components:** Always use Tailwind utility classes or custom theme tokens defined in `src/styles.css`.

---

## ✨ 3. Glassmorphism & Micro-Interactions

- **AI Sparkle Cards:** Use `backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-indigo-200/60 dark:border-indigo-800/40 shadow-sm`.
- **Transitions:** Apply `transition-all duration-200 ease-in-out` on buttons, navigation items, and interactive table rows.
