# Startaply Master Design System

## A. Brand Foundation

**Product Purpose:** To provide Indian freshers, early-career candidates, and students with a verified, accessible, and fast platform to discover government, private, startup, and job-mela opportunities.
**Audience:** Early-career job seekers relying primarily on low/mid-range Android devices over 3G/4G networks.
**Visual Direction:** Authoritative Momentum with Human Warmth.
**Design Principles:**
1. **Clarity First:** No decorative obfuscation. Content must be immediately readable.
2. **Speed is Premium:** A fast-loading, jank-free experience on low-end devices conveys high quality better than complex animations.
3. **Uncompromising Truth:** If we don't have the data, we don't show it. Zero fabricated metrics or fake social proof.

## B. Content Credibility Policy

**1. Claim Classifications & Resolutions:**
- *StatsStrip.jsx (10K+ Verified Jobs, 500+ Partner Companies, 100% Free Platform, 15+ Categories)*: Replace with verified dynamic data or hide until verifiable.
- *CollegeCollabBanner.jsx (500+ Partner Colleges)*: Replace with verified dynamic data or hide.
- *Footer.jsx ("Join thousands of professionals...")*: Owner verification required or remove.
- *Categories.jsx ("Explore thousands of opportunities...")*: Owner verification required or remove.
- *Hero active-job count*: Derives correctly from loaded jobs (Keep).
- *TrendingCompanies.jsx*: Renders company data from the public API/context (Keep). Any dummy/test records in the database must be cleaned through data administration, not by deleting source arrays.
- *JobMelaTicker.jsx (Outdated 2024 ticker text, unverified claims)*: Replace with verified dynamic data or hide until verifiable.

**2. Testimonial Sample Policy:**
- Existing fallback names/employers/outcomes must not be presented as real.
- Do not use real employer brands for illustrative testimonials.
- Do not use realistic headshots implying real identity.
- Samples must use neutral persona labels such as:
  - "Illustrative fresher journey"
  - "Illustrative career switch"
  - "Illustrative government-job seeker"
- Every sample card must visibly display: "Illustrative example — not a verified user story."
- Sample cards must not claim actual placement, interview, salary, or employer outcome.
- Verified API testimonials must carry a separate verified treatment only when ownership/consent is established.
- Samples should be removable through one explicit content-mode decision.
- *Strongest counterargument:* Public sample testimonials may still weaken trust; hiding the section remains the safer production option until verified stories exist.

## C. Color Tokens
*(Contrast Intent: All text on Background/Surface must meet WCAG AA (4.5:1).)*
- **Background:** `White` (#FFFFFF) or Dark `Black` (#000000)
- **Brand (Primary):** `Emerald-600` (#059669) Light / `Emerald-500` (#10B981) Dark

## D. Typography Policy

**Font Family:** `Inter` (Primary web font, backed by strong system fallbacks).
- Use `Inter` as the single primary UI family unless owner later supplies a brand font.
- Remove duplicate `Inter` loading (currently in `index.html` and `index.css @import`).
- Remove `Poppins` if no real consumer exists.
- Load only required weights.
- Prefer one optimized request or a self-hosted variable font only if asset and caching strategy justify it.
- Preserve strong system fallbacks. Do not call Inter "system-native" (it is a web font).
- Avoid typography that delays first rendering.

## E. Public Component Primitives

**Implementation Rules:**
- Global tokens live in `index.css` and Tailwind configuration.
- Reusable public UI primitives (e.g., standard Buttons, Inputs) may live in `src/components/common` or a narrowly introduced `src/components/ui` directory.
- Do not mix admin-only constants with public components. Do not place public primitives in `src/components/admin/adminConstants.js`.
- Do not create wrappers for every HTML element.
- Introduce a primitive only when at least two real consumers need it.
- Preserve semantic HTML.
