/**
 * Pure function to evaluate whether continuous decorative motion should run.
 * Rules:
 * - Continuous decorative motion never runs when document is hidden.
 * - Continuous decorative motion never runs when section is offscreen.
 * - Continuous decorative motion never runs with prefers-reduced-motion.
 * - Expensive decorative motion defaults off on mobile.
 */
export function shouldRunContinuousMotion({ sectionVisible, documentVisible, prefersReducedMotion, mobile }) {
  if (prefersReducedMotion) return false;
  if (!documentVisible) return false;
  if (!sectionVisible) return false;
  if (mobile) return false;
  return true;
}

/**
 * Returns a bounded count for repeating DOM elements in marquees.
 * @param {number} uniqueCount - Number of unique items
 * @param {number} minimum - Minimum required total items for a track
 * @param {number} maximum - Maximum allowed total items for a track
 */
export function getBoundedRepeatCount(uniqueCount, minimum, maximum) {
  if (typeof uniqueCount !== 'number' || uniqueCount <= 0) return 0;
  
  // Safe bounds checking
  const safeMin = Math.min(minimum, maximum);
  const safeMax = Math.max(minimum, maximum);
  
  return Math.min(safeMax, Math.max(safeMin, uniqueCount));
}
