# Startaply Engineering Constitution for Agents

This document defines the rules for any autonomous agent (Antigravity or otherwise) working on the Startaply codebase.

## 1. Safety and Stability First
- **Preserve Existing Behaviour:** Never silently alter routes, APIs, authentication, RBAC, database schemas, or core user features unless explicitly requested.
- **Low-End First:** The primary performance target is a low/mid-range Android device on a 3G/4G connection. Optimize for frame stability and minimal JS payload.
- **Root-Cause First:** Prefer durable root-cause solutions over symptom masking. A temporary mitigation is allowed only when required for safety or service continuity, and must be clearly labelled, reversible, time-bounded, documented, and paired with a tracked durable follow-up. Never solve stale-data issues through `window.location.reload()` or by merely extending TTLs.

## 2. Evidence and Measurement
- **Measure Before Optimizing:** Never claim a performance improvement without before/after evidence. Do not invent FPS, Lighthouse, or Core Web Vitals scores.
- **Verify Execution:** Never claim a check, test, or build ran unless the command actually executed successfully.
- **Post-Change Verification:** Run checks proportional to the change. Run targeted tests for affected logic and `npm run build` after application or configuration changes. Run `npm ci` from a clean state when package manifests or lockfiles change and in final CI verification. Documentation-only changes require relevant content checks and `git diff --check`. Never declare completion while required checks fail.

## 3. Architecture and Scope
- **No Broad Rewrites:** Incremental migrations are required. Large rewrites must have explicit approval and a rollback plan.
- **Dependency Restraint:** Do not add libraries (React Query, SWR, Zustand, virtualizers, framer-motion extensions) unless repository evidence demonstrates strict necessity and the migration cost is justified.
- **Accessibility & UX:** Maintain touch targets (min 44x44 CSS px), respect `prefers-reduced-motion`, and ensure WCAG compliant contrast ratios.

## 4. Documentation and Workflows
- **Durable Decisions:** Store important architectural decisions in the repository (e.g., `AGENTS.md`, `README.md`, or `docs/`), not just in chat history.
- **Reviewable Batches:** Submit work in small, logical, and reviewable batches. Wait for human approval before progressing to the next implementation phase.

## 5. Constructive Dissent and Decision Protocol
- Treat every user or agent suggestion as a hypothesis, not an automatic decision.
- Verify assumptions against source code, runtime evidence, tests, and authoritative documentation.
- Present the strongest reasonable counterargument and compare correctness, maintainability, performance, regression risk, reversibility, and operational cost.
- Recommend the best option even when it differs from the user's initial suggestion.
- Do not manufacture disagreement when evidence clearly supports a suggestion.
- Clearly distinguish verified facts, measured results, hypotheses, and opinions.
- The user retains final approval authority for consequential changes.
