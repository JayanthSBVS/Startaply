# Jobs Data Freshness Architecture

## Overview
This document outlines the data freshness and caching architecture implemented for Jobs (Batch 1A) in the Startaply platform. The model is immediate same-browser invalidation plus focus/reconnect revalidation—not globally guaranteed real-time. Different devices/users do not receive push events; their state naturally converges upon navigation, focus, or reconnect.

## 1. Previous Three Stale Layers
Previously, job mutations experienced significant propagation delays across clients due to three uncoordinated caching layers:
1. **Client `localStorage` (JobsContext):** Stored raw job payloads with a 30-second Time-To-Live (TTL).
2. **Process-Local Memory Cache (`api/db.js`):** Maintained an in-memory `Map` across serverless instances for 30-60 seconds.
3. **Vercel Edge Caching:** Relied on `s-maxage=30, stale-while-revalidate=120`, allowing CDN nodes to serve stale content.

A mutation in one serverless instance could not reliably purge another instance's memory cache, the Vercel Edge, or another user's `localStorage`, leading to split-brain states where "isFeatured" or "isVisible" toggles failed to reflect predictably.

## 2. Jobs-Only Scope
This architectural update is strictly scoped to the Jobs domain. Companies, Job Melas, Preparation Data, Hero Banners, Testimonials, and Live Ticker continue to use the legacy caching architecture to ensure scoped, verifiable, and risk-managed delivery.

## 3. New Request and Invalidation Flow
The new flow guarantees immediate freshness for Jobs locally and across same-browser tabs:
- **Server:** Jobs read endpoints explicitly send `Cache-Control: no-store, max-age=0` and bypass the local `Map` cache.
- **Client (Admin):** Upon a successful mutation (`POST/PUT/DELETE` to jobs), the UI broadcasts a lightweight invalidation event via `publishFreshness`. (Admin uses `publishFreshness`, not `subscribeToFreshness`).
- **Client (Public):** The `JobsProvider` and `JobsPage` listen for these events via `subscribeToFreshness`, automatically triggering a background refetch or UI prompt to pull the latest state natively.

## 4. Message Format, Deduplication, and Transport
- **Message:** Includes `version`, `msgId`, `senderId`, `domain`, `mutationType`, `entityId`, and `timestamp`.
- **Router:** A pure router handles message dispatch. Same-tab local dispatch occurs exactly once. Cross-tab dispatch is deduplicated.
- **Transport:** Uses `BroadcastChannel` for same-browser cross-tab delivery. Falls back to a `localStorage` metadata-only event mechanism for older browsers.
- **Tests:** Core message routing logic is covered by dependency-free Node tests using `node:test`.

## 5. Request Concurrency (AbortController)
To prevent race conditions during rapid fetches:
- `JobsContext` maintains a `requestSequenceRef` and an active `AbortController`.
- Any new fetch increments the sequence ID and explicitly `.abort()`s the preceding request.
- React state is only updated if the active request's sequence ID matches the current sequence and the request was not aborted.

## 6. JobsPage Deep Pagination UX
- **Page 1:** JobsPage page 1 refreshes automatically in the background on invalidation, keeping current results visible until the new data arrives, then replaces them seamlessly.
- **Page > 1 (Deep Pagination):** Deep pagination shows an explicit stale/update banner ("Listings have changed") to avoid aggressively resetting the user's reading position. Load More remains functional after any number of invalidations. When the user manually clicks "Refresh results", pagination explicitly resets to Page 1 and fetches fresh data.

## 7. Why Persistent Job Payload Caching Was Removed
Storing large arrays of job objects in `localStorage` caused race conditions and complex cache reconciliation. Browsers are fast enough to fetch dynamic job lists directly; enforcing real-time fetches simplifies client-side state and ensures accurate data presentation.

## 8. Why React Query Was Not Added Yet
Adding React Query (or SWR) would necessitate a significant dependency footprint, a large-scale refactor of all API consumers, and retraining for future maintainers. The native `AbortController` and `BroadcastChannel` approach solves the immediate data-freshness requirements with zero added dependencies, aligning with the "Dependency Restraint" constitution.

## 9. Criteria for Expanding the Pattern
This architecture should be expanded to Companies or Melas only when:
1. The domain experiences similar cross-tab stale-data complaints.
2. The mutation frequency justifies the removal of Edge caching.
3. The Batch 1A jobs implementation has proven stable in production based on: successful mutation matrix, error rate, request volume, database latency, and no stale-data reports.

## 10. Rollback Procedure
If this architecture causes excessive database load or unforeseen regressions:
1. **Primary:** Rollback uses `git revert <Batch-1A-commit>` to cleanly back out the changes.
2. **Secondary:** If a full revert is not possible, restore `setCache` usage on endpoints, re-introduce `cache_jobs` payload logic in `JobsContext`, and remove `publishFreshness`/`subscribeToFreshness` invocations.

## 11. Known Double-Fetch Risk
- JobsProvider and JobsPage currently own separate job requests.
- On some focus/invalidation paths, both can fetch.
- This is verified as approximately two requests in affected scenarios.
- It is deferred to a later route/data-ownership batch.
- It must not be "fixed" through stale caching or by suppressing required freshness.

## Verification Status and Deferred Checks

Verified:
- Dependency-free freshness tests pass
- Message validation and deduplication tests pass
- Same-tab pure-router behaviour tests pass
- Latest-request-wins logic is covered by code review
- npm ci passes
- Production build passes
- git diff --check passes

Deferred:
- Final browser verification of results-heading focus after manual refresh
- Final browser verification of aria-live completion announcement
- Final browser verification of the non-blocking refresh-error Retry UI
- Real deployment-platform cache-header verification
- Final database/hosting integration because Vercel and Neon are temporary
- JobsProvider plus JobsPage duplicate request ownership

These deferred checks must be included in the later full browser QA batch before a final production launch. They are not represented as completed.
