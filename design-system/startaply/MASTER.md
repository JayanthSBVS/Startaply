# Startaply Master Design System

## 1. Brand Foundation

**Product Purpose:** To provide Indian freshers, early-career candidates, and students with a verified, accessible, and fast platform to discover government, private, startup, and job-mela opportunities.
**Audience:** Early-career job seekers relying primarily on low/mid-range Android devices over 3G/4G networks.
**Visual Direction:** Authoritative Momentum with Human Warmth.
**Design Principles:**
1. **Clarity First:** No decorative obfuscation. Content must be immediately readable.
2. **Speed is Premium:** A fast-loading, jank-free experience on low-end devices conveys high quality better than complex animations.
3. **Uncompromising Truth:** If we don't have the data, we don't show it. Zero fabricated metrics or fake social proof.

## 2. Content Credibility Policy

**Claim Classifications & Resolutions:**
- *StatsStrip.jsx (10K+ Verified Jobs, 500+ Partner Companies, 100% Free Platform, 15+ Categories)*: Replace with verified dynamic data or hide until verifiable.
- *CollegeCollabBanner.jsx (500+ Partner Colleges)*: Replace with verified dynamic data or hide.
- *Footer.jsx ("Join thousands of professionals...")*: Owner verification required or remove.
- *Categories.jsx ("Explore thousands of opportunities...")*: Owner verification required or remove.
- *Hero active-job count*: Derives correctly from loaded jobs (Keep).
- *TrendingCompanies.jsx*: Renders company data from the public API/context (Keep). Any dummy/test records in the database must be cleaned through data administration, not by deleting source arrays.
- *JobMelaTicker.jsx (Outdated ticker text, unverified claims)*: Replace with verified dynamic data or hide until verifiable.

**Testimonial Sample Policy:**
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

## 3. Semantic Color System

### A. Primitive Palette
- **Neutral/Ink (Slate):** `50:#F8FAFC`, `100:#F1F5F9`, `200:#E2E8F0`, `300:#CBD5E1`, `400:#94A3B8`, `500:#64748B`, `600:#475569`, `700:#334155`, `800:#1E293B`, `900:#0F172A`, `950:#020617`
- **Warm-Neutral Surface:** `Off-White:#FAFAFA`
- **Emerald Brand:** `50:#ECFDF5`, `400:#34D399`, `500:#10B981`, `600:#059669`, `700:#047857`, `800:#065F46`
- **Blue (Info/Focus):** `50:#EFF6FF`, `500:#3B82F6`, `600:#2563EB`
- **Amber (Warning):** `50:#FFFBEB`, `500:#F59E0B`, `600:#D97706`, `700:#B45309`
- **Rose/Red (Error):** `50:#FEF2F2`, `500:#EF4444`, `600:#DC2626`

### B. Semantic Light Tokens
- `--color-bg`: `#FFFFFF`
- `--color-surface`: `#FAFAFA`
- `--color-surface-raised`: `#FFFFFF`
- `--color-surface-muted`: `#F1F5F9`
- `--color-text`: `#0F172A`
- `--color-text-secondary`: `#475569`
- `--color-text-muted`: `#64748B`
- `--color-border`: `#E2E8F0`
- `--color-border-strong`: `#CBD5E1`
- `--color-brand`: `#047857`
- `--color-brand-hover`: `#065F46`
- `--color-brand-soft`: `#ECFDF5`
- `--color-on-brand`: `#FFFFFF`
- `--color-focus`: `#3B82F6`
- `--color-success`: `#047857`
- `--color-warning`: `#B45309`
- `--color-error`: `#DC2626`
- `--color-info`: `#2563EB`
- `--color-overlay`: `rgba(15, 23, 42, 0.4)`

### C. Semantic Dark Tokens
- `--color-bg`: `#000000`
- `--color-surface`: `#020617`
- `--color-surface-raised`: `#0F172A`
- `--color-surface-muted`: `#1E293B`
- `--color-text`: `#F8FAFC`
- `--color-text-secondary`: `#CBD5E1`
- `--color-text-muted`: `#94A3B8`
- `--color-border`: `#1E293B`
- `--color-border-strong`: `#334155`
- `--color-brand`: `#10B981`
- `--color-brand-hover`: `#34D399`
- `--color-brand-soft`: `rgba(16, 185, 129, 0.1)`
- `--color-on-brand`: `#020617`
- `--color-focus`: `#3B82F6`
- `--color-success`: `#10B981`
- `--color-warning`: `#F59E0B`
- `--color-error`: `#EF4444`
- `--color-info`: `#3B82F6`
- `--color-overlay`: `rgba(0, 0, 0, 0.6)`

### Contrast Intent Table
| Pairing | Intent | Calculated Ratio | WCAG 2.1 Result |
|---|---|---|---|
| Light: text on bg | Primary Body | 17.85:1 (Slate-900 / White) | Pass AAA |
| Light: text-secondary on bg | Secondary Text | 7.58:1 (Slate-600 / White) | Pass AAA |
| Light: text-muted on bg | Muted Text | 4.76:1 (Slate-500 / White) | Pass AA |
| Light: on-brand on brand | Primary Button | 5.48:1 (White / Emerald-700) | Pass AA |
| Light: warning on bg | Warning Text | 4.90:1 (Amber-700 / White) | Pass AA |
| Dark: text on bg | Primary Body | 20.07:1 (Slate-50 / Black) | Pass AAA |
| Dark: text-muted on bg | Muted Text | 8.19:1 (Slate-400 / Black) | Pass AAA |
| Dark: on-brand on brand | Primary Button | 7.95:1 (Slate-950 / Emerald-500) | Pass AAA |


## 4. Typography Tokens

**Font Family:** `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
*(Note: Inter is a web font with system fallbacks. Remove duplicate loading. Load only weights 400, 500, 600, 700).*

**Maximum Reading Width:**
- Long-form body: ~65ch
- UI labels/cards: Not constrained by 65ch blindly

| Token | Mobile | Desktop | Line Height | Weight | Letter Spacing | Intended Use |
|---|---|---|---|---|---|---|
| **Display** | 40px | 56px | 1.1 | 700 (Bold) | -0.02em | Hero headers, massive impact |
| **H1** | 32px | 40px | 1.2 | 700 (Bold) | -0.01em | Page titles |
| **H2** | 24px | 32px | 1.25 | 600 (SemiBold) | 0 | Section headers |
| **H3** | 20px | 24px | 1.3 | 600 (SemiBold) | 0 | Card titles, subsections |
| **H4** | 18px | 20px | 1.4 | 600 (SemiBold) | 0 | Small card titles |
| **Body Large** | 18px | 18px | 1.5 | 400 (Regular) | 0 | Hero subtitles, prominent text |
| **Body** | 16px | 16px | 1.5 | 400 (Regular) | 0 | Default paragraph text |
| **Body Small** | 14px | 14px | 1.5 | 400 (Regular) | 0 | Secondary descriptions |
| **Label** | 12px | 12px | 1.0 | 600 (SemiBold) | 0.05em | Uppercase form labels, badges |
| **Caption** | 12px | 12px | 1.5 | 500 (Medium) | 0 | Timestamp, helper text |
| **Button** | 14px | 14px | 1.0 | 600 (SemiBold) | 0 | Interactive actions |
| **Data/Number** | Inherits | Inherits | Inherits | Inherits | Inherits | Numeric stats (uses tabular nums) |

## 5. Spacing and Layout Tokens

**Base Scale (4px increments):**
`0 (0px)`, `1 (4px)`, `2 (8px)`, `3 (12px)`, `4 (16px)`, `6 (24px)`, `8 (32px)`, `10 (40px)`, `12 (48px)`, `16 (64px)`, `20 (80px)`, `24 (96px)`

**Layout Specifics:**
- **Mobile Page Gutter:** `16px` (spacing-4)
- **Tablet Gutter:** `24px` (spacing-6)
- **Desktop Gutter:** `32px` (spacing-8)
- **Maximum App Content Width:** `1200px`
- **Maximum Reading Width:** `65ch`
- **Section Vertical Spacing:** `64px` (mobile), `96px` (desktop)
- **Card Padding:** Compact (`12px`), Default (`16px`), Comfortable (`24px`)
- **Form Field Gaps:** `20px` (between fields)
- **Navigation Heights:** Desktop `64px`, Mobile Bottom `64px`
- **Mobile Safe-Area Bottom Offset:** `env(safe-area-inset-bottom)`
- **Sticky Header Offset:** `64px` (scroll-padding-top)

## 6. Shape and Elevation Tokens

**Radius Scale:**
- `xs`: `2px`
- `sm`: `4px`
- `md`: `6px` (Inputs, buttons)
- `lg`: `8px` (Small cards)
- `xl`: `12px` (Primary job cards, dialogs)
- `full`: `9999px` (Genuine pills/chips/avatar circles only. Cards should not use 2rem/3rem rounding)

**Border Policy:** Prefer border/tonal elevation over shadows.
- `Default`: `1px solid var(--color-border)`
- `Strong`: `1px solid var(--color-border-strong)`
- `Interactive Hover`: `1px solid var(--color-text-muted)`
- `Error`: `1px solid var(--color-error)`
- `Focus`: `2px solid var(--color-focus)` with offset

**Shadow Scale:** Restrained use. No diffused shadow on every card. No ambient glow. No backdrop blur in global shell.
- `none`: `0 0 0 transparent`
- `xs`: `0 1px 2px rgba(0,0,0,0.05)`
- `sm`: `0 1px 3px rgba(0,0,0,0.1)`
- `md`: `0 4px 6px -1px rgba(0,0,0,0.1)`
- `overlay`: `0 10px 15px -3px rgba(0,0,0,0.2)`
*(Dark mode differences: Drop shadows blend into background. Elevation in dark mode relies entirely on `surface-raised` background color and `border-strong` stroke).*

## 7. Motion Tokens

*(Integrates Batch 2A Frame-Stability Policy)*

**Durations:**
- `--duration-instant`: `0ms`
- `--duration-fast`: `150ms` (Essential feedback, hover states)
- `--duration-base`: `250ms` (State transition, modest expansions)
- `--duration-slow`: `400ms` (Page/section entrance)

**Easings:**
- `--ease-standard`: `cubic-bezier(0.4, 0, 0.2, 1)`
- `--ease-enter`: `cubic-bezier(0, 0, 0.2, 1)` (Decelerates into view)
- `--ease-exit`: `cubic-bezier(0.4, 0, 1, 1)` (Accelerates out)

**Classification & Rules:**
- **Essential feedback:** Fast, transform/opacity only.
- **State transition:** Base, exit faster than enter.
- **Page/section entrance:** Slow, relies on IntersectionObserver.
- **Decorative continuous motion:** Strictly prohibited on mobile and reduced-motion profiles.
- **Rules:** Transform/opacity preferred. No width/height animation for routine UI where transform works. No component invents custom timing. Reduced-motion fallback required.

## 8. Component Specifications

1. **Primary button:** Anatomy: Text + optional icon. Padding: `12px` x `24px`. Radius: `md`. Typography: `Button`. Default: Brand bg, On-brand text. Hover: Brand-hover bg. Focus: 2px offset ring. Disabled: Opacity 50%, no pointer. Mobile: Min `44x44px` target. Accessibility: `aria-label` for icon-only.
2. **Secondary button:** Default: Transparent bg, border-strong, text primary. Hover: Surface-muted bg. Active: Scale 98%.
3. **Tertiary/text button:** Default: Transparent bg, zero border, text-secondary. Hover: Surface-muted bg.
4. **Destructive button:** Default: Error bg, white text. Hover: Red-700 bg.
5. **Icon button:** Dimensions: `44x44px`. Center icon. Radius: `md` or `full`.
6. **Search field:** Padding: `12px` left, `44px` height. Radius: `md`. Default: Surface-raised bg, Border default. Focus: Focus ring, no layout shift.
7. **Text input:** Label top (Label typography). Padding `10px` x `12px`. Radius: `md`. Error: Error border, Error text caption below.
8. **Select:** Same as text input, trailing chevron icon.
9. **Filter chip:** Pill shape (`full` radius). Padding: `6px` x `12px`. Toggle state changes bg to brand-soft, text to brand.
10. **Tabs:** Transparent buttons with 2px bottom border (Brand) when active, transparent when inactive.
11. **Job card:** Padding: `16px`. Radius: `xl`. Border: Default. Default: Surface-raised bg. Hover: Border-strong, Shadow-sm. Anatomy: Logo top-left, title bold, metadata row. Active area spans entire card.
12. **Company card:** Padding: `16px`. Radius: `lg`. Centered logo, H4 title.
13. **Category card:** Padding: `16px`. Radius: `lg`. Surface-muted bg default. Hover: Surface-raised, Shadow-xs.
14. **Trust badge:** Height `24px`. Radius `full`. Bg: Brand-soft. Text: Brand. Verified check icon.
15. **Status badge:** Label typography. Height `24px`. Radius `sm`. Warning/Success/Error variants.
16. **Alert:** Padding `16px`. Radius `md`. Border + soft bg tint matching intent (Info/Warning/Error).
17. **Toast:** Absolute bottom-right (Desktop) or top-center (Mobile). Shadow-overlay. `400ms` standard enter.
18. **Skeleton:** Bg: Surface-muted. Pulse animation (`duration-slow`). Radius matches placeholder element.
19. **Empty state:** Centered column. `48px` muted icon. H4 title. Body-small desc. Optional primary action.
20. **Modal:** Max-width `500px`. Radius `xl`. Shadow-overlay. Overlay bg `rgba(15,23,42,0.4)`. Close button top-right. Accessibility: `aria-modal="true"`.
21. **Side drawer:** Mobile only. Slides from bottom. Radius `xl` top corners only. Width 100%, Max-height 90vh.
22. **Desktop navbar:** Height `64px`. Sticky top. Bg: Surface-raised with bottom border.
23. **Mobile bottom navigation:** Height `64px`. Fixed bottom. 4 tabs. Icons `24x24px`. Caption typography.
24. **More sheet:** Mobile drawer invoked from bottom nav. Simple vertical list of secondary links.
25. **Footer:** Standard flex-col/row block. Bg: Surface-muted. Padding: `64px` top/bottom.
26. **Section heading:** H2 typography. Margin-bottom `24px`.

## 9. Batch 3A File-Level Contract

**Allowed Scope:**
Batch 3A is explicitly permitted to change the global visual foundation and shell.
- `src/styles/index.css`
- `tailwind.config.js`
- `index.html`
- `src/components/common/Navbar.jsx`
- `src/components/common/MobileBottomNav.jsx`
- `src/components/common/Footer.jsx`
- `src/components/common/ThemeToggle.jsx`
- Reusable public UI primitives (e.g., standard Buttons, Inputs) may be placed in `src/components/common` or `src/components/ui` only if at least two Batch 3A consumers need them.

**Explicitly Prohibited Changes:**
- Routes
- `JobsContext` / data fetching logic
- Home section components
- JobsPage
- Admin dashboard
- API endpoints
- Backend
- Business copy
- Feature behaviour
- Placing public primitives in `src/components/admin/adminConstants.js`

**Acceptance Criteria for Batch 3A:**
1. Existing routes remain completely unchanged.
2. Mobile safe area works across all modern mobile browsers.
3. Keyboard navigation is fully functional.
4. Focus is visibly distinct in both light and dark modes.
5. Light/dark modes remain visually consistent and readable.
6. No horizontal layout overflow at 360px width.
7. No new continuous decorative motion introduced.
8. No new dependencies added (no new npm packages).
9. `package-lock.json` remains completely unchanged.
10. Application builds successfully and all existing tests pass.
11. Final Javascript bundle and CSS growth metrics are explicitly reported.
