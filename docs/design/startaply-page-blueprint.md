# Startaply Page Blueprints & Information Architecture

## 1. Global Shell & Navigation

**Global Desktop Navigation (`Navbar.jsx`):**
- **Layout:** Sticky top header. Logo, Primary Links (Home, Jobs, Melas, etc.), CTA.

**Global Mobile Navigation (`MobileBottomNav.jsx`):**
- **Policy:** `MobileBottomNav.jsx` already exists and is mounted globally. We will restyle and simplify the existing component, not create a new one.
- **Goals:** Preserve current routes (Home, IT Jobs, Govt Jobs, More) unless separately approved. Improve hierarchy, focus, safe-area spacing, and touch feedback. Review More-sheet accessibility. Avoid creating a duplicate mobile navigation system.

**Footer Strategy (`Footer.jsx`):**
- **Policy:** The Footer remains part of the page shell.
- **Goals:** Keep legal and navigation links accessible and crawlable for SEO. Reserve layout space to prevent cumulative layout shift (CLS).
- **Performance:** Below-fold rendering may later use safe CSS/content-visibility techniques if measured. Do not defer it through a flashing Suspense fallback or lazy-loading that harms navigation/SEO.

---

## 2. Homepage Information Architecture

**Approved Structure:**

### 1. Global Navigation
- **User Purpose:** Global wayfinding and context.
- **Business Purpose:** Funnel to core value props.
- **Content:** Sticky Navbar (Desktop) / Bottom Nav (Mobile).

### 2. Search-led Hero
- **User Purpose:** Immediate search for a specific role or discover trending paths.
- **Business Purpose:** Immediate engagement; reduce bounce rate.
- **Content:** H1, Search Input, Quick Filters. Active job count derived strictly from loaded data.

### 3. Trust and verification proof
- **User Purpose:** Understand why this platform is safe.
- **Business Purpose:** Establish credibility against scams.
- **Content:** Trust proof must come from verification process explanation, direct-application clarity, freshness/last-updated indicators, transparent job details, and scam reporting/support. Real data only.

### 4. Fresh + Featured opportunities
- **User Purpose:** See what's immediately available without searching.
- **Business Purpose:** Drive clicks to job details.
- **Content:** Grid or horizontally scrolling list of premium job cards.

### 5. Career paths/categories
- **User Purpose:** Browse roles by broader categories.
- **Business Purpose:** Capture users who don't have a specific search query.
- **Content:** Grid of category pills/cards.

### 6. Job Mela / Campus opportunity
- **User Purpose:** Find high-volume hiring events.
- **Business Purpose:** Highlight exclusive/differentiating content.
- **Content:** Prominent Mela cards or horizontal list.

### 7. Verified hiring network
- **User Purpose:** Discover aspirational employers.
- **Business Purpose:** Build platform authority.
- **Content:** Directory or list of verified company logos (data from public API, no dummy array).

### 8. Compact three-step How Startaply Works
- **User Purpose:** Understand the value proposition simply.
- **Business Purpose:** Reinforce direct applications and no middlemen.
- **Content:**
  1. Discover verified opportunities.
  2. Compare role details and eligibility.
  3. Apply directly or through clearly explained Easy Apply.
- **Goals:** Be compact. Use three simple items. Avoid a large decorative timeline. Avoid animated ghost numbers/glows. Load below primary opportunities. Remove "Land Your Role" claim (cannot guarantee employment).

### 9. Illustrative/verified success proof only under the documented policy
- **User Purpose:** See social proof.
- **Business Purpose:** Conversion.
- **Content:** Testimonials must be strictly verified API data or clearly labeled "Illustrative example — not a verified user story" following the Master design system policy.

### 10. Footer
- **User Purpose:** Find secondary links, support, and legal docs.
- **Content:** Standard static footer links.

---

## 3. Batch 3A Blueprint (Global visual foundation and shell)

**Scope:**
Batch 3A focuses strictly on the global visual foundation and shell. It must not redesign Homepage sections yet. 
*(Batch 3B will be Homepage sections; Batch 3C will be Jobs discovery and job details).*

**Files likely affected:**
- `src/styles/index.css`
- `tailwind.config.js`
- `index.html`
- `src/components/common/Navbar.jsx`
- `src/components/common/MobileBottomNav.jsx`
- `src/components/common/Footer.jsx`
- `src/components/common/ThemeToggle.jsx`
- Common reusable controls only when justified.
*(Note: Do not include `src/components/admin/adminConstants.js` as it is admin-specific).*
