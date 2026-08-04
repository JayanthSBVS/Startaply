# Frame Stability and Motion Policy

This document outlines the architecture and policies for preserving low-end Android frame stability and ensuring accessibility regarding continuous motion.

## Motion Policy

The core policy is defined in `src/utils/motionPolicy.js` and exposed via the `usePageActivity` hook.

Continuous decorative motion (timers, marquees, parallax) **MUST NOT** run when:
1. The section is offscreen (handled via `IntersectionObserver`).
2. The document is hidden (e.g., user switched tabs, handled via `visibilitychange`).
3. The user has requested reduced motion (handled via `prefers-reduced-motion`).
4. The device is mobile (handled via `max-width: 768px`).

## Exact Timer Behavior

- **Hero Image Rotation (6s):** Paused when `!shouldAnimate` (offscreen, hidden document, mobile, or reduced motion).
- **Hero Placeholder Rotation (3s):** Paused when `!shouldAnimate`.
- **Job Mela Ticker Badge (3.5s):** Paused when `!shouldAnimate`.

## Exact Duplicate DOM Caps

Duplicate DOM nodes are expensive for styling and layout calculations.

### Trending Companies
- **Before:** Unconditionally duplicated the `companies` array to 20 items per track (40 items total), even if the array already contained many items.
- **After:** Duplication is bounded using `COMPANY_TRACK_MIN=8` and `COMPANY_TRACK_MAX=12`. For the current 6-company dataset, this produces 8 items per track, resulting in 16 animated desktop cards total. Mobile uses a unique manually scrollable list with no marquee tracking or duplication.
- **Accessibility:** Duplicated visual copies are explicitly marked with `aria-hidden="true"`.

### Job Mela Ticker
- **Before (Secondary Ticker):** Unconditionally duplicated to 30 copies, regardless of the array size.
- **After (Secondary Ticker):** Bounded using `TICKER_SECONDARY_MIN=8` and `TICKER_SECONDARY_MAX=16`. Mobile/Reduced-Motion uses `staticMode`, disabling all animations, marquees, pinging dots, and showing a unique horizontal list.
- **Before (Primary Ticker):** 4 copies unconditionally.
- **After (Primary Ticker):** 1 copy (no animation) for reduced-motion/mobile, otherwise 2 copies for animated desktop.
- **Accessibility:** Duplicated visual copies are explicitly marked with `aria-hidden="true"`.

## Remaining Risks

- **Multiple Global Scroll Listeners:** The application still heavily relies on `framer-motion`'s `useScroll` across various components (even if currently paused or decoupled from Hero mobile). Each instantiation creates additional main-thread overhead. Refactoring to a single global scroll dispatcher is a known future optimization target.
- **IntersectionObserver Overlap:** While `usePageActivity` enforces a stable root margin to prevent thrashing, multiple observers tracking large elements could overlap.

## Deferred Verification

- **Browser FPS Profiling:** Real-device frame stability profiling and tracing (e.g., Chrome DevTools Performance tab, Lighthouse FPS metrics on Android) are deferred to a subsequent validation phase.
