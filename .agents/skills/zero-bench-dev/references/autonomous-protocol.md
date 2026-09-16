# 🚀 Autonomous Development & Deployment Protocol

This document establishes the binding operational constraints, architectural standards, and automated deployment pipelines for all projects within the **BenchZero** workspace. Both the Architect Agent and the Execution Agent must adhere to this specification with 100% compliance.

---

## 👥 1. Core Roles & Responsibilities

### 👑 The Boss (Senior Architect & Tech Lead)
- **Entities:** Claude / Gemini
- **Responsibilities:**
  - Feature planning and technical breakdown.
  - Domain modeling and architectural boundaries.
  - System orchestration and module wiring.
  - Design verification against Stitch specifications.
  - Defining strict acceptance criteria and verification plans.

### 🛠️ The Employee (Execution Agent)
- **Entities:** `opencode` / `bigpickle`
- **Responsibilities:**
  - Code generation following strict domain templates.
  - Unit testing and E2E test execution.
  - CI/CD automation execution and deployment runs.
  - Performance optimization and bundle size vigilance.

---

## 🔄 2. The Planning & Execution Pipeline

The execution loop follows a strict, sequential pipeline to prevent code drift and ensure alignment with the architect's vision:

```
[Trigger] ➔ Create Plan File ➔ [Populate Markdown] ➔ Run opencode CLI ➔ Execute ➔ Review
```

### Protocol Steps:
1. **Initialization:** On any major feature or architectural trigger, enter **Plan Mode**.
2. **Artifact Creation:** Create a dedicated planning markdown file in the active working directory:
   - **Path:** `plan/DD_MM_YYYY-HH_mm.md` *(Sanitize colons and slashes for filesystem compatibility).*
   - **Example:** `plan/16_09_2026-23_05.md`
3. **Plan Population:** The Boss defines:
   - User review items & open questions.
   - Domain model externalization paths.
   - Component & widget decomposition.
   - Verification checklist.
4. **Execution Delegation:** Pass the plan directly into the employee CLI tool:
   ```bash
   opencode --context=plan/DD_MM_YYYY-HH_mm.md
   ```
5. **Architectural Review:** The Boss verifies the output against TypeScript strictness, build outputs, and Stitch visual fidelity.

---

## 🏛️ 3. Pragmatic Engineering Philosophy

- **No Over-Engineering:** Implement the cleanest, fastest production-grade solution that satisfies requirements. Avoid redundant abstraction layers while steering clear of dirty workarounds.
- **SOLID Principles:** Enforce Single Responsibility Principle (SRP) across every component, store, model, and service.
- **Model Context Protocol (MCP) Integration:** Maintain accessible MCP integration and guarantee 100% design fidelity against the Stitch Design System (Project ID `15147121731840790718`).
