import { useState, useEffect } from 'react';
import { shouldRunContinuousMotion } from '../utils/motionPolicy';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handler = (event) => setMatches(event.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handler);
      return () => mediaQueryList.removeEventListener('change', handler);
    } else if (mediaQueryList.addListener) {
      // Legacy support
      mediaQueryList.addListener(handler);
      return () => mediaQueryList.removeListener(handler);
    }
  }, [query]);

  return matches;
}

export function usePageActivity(sectionRef) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Track document visibility
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Initial state
    setIsDocumentVisible(document.visibilityState === 'visible');

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Track section intersection
  useEffect(() => {
    if (!sectionRef || !sectionRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const element = sectionRef.current;
    
    // Stable observer: trigger 50% before entering viewport to prevent boundary thrashing
    const observer = new IntersectionObserver(
      (entries) => {
        // Since we only observe one element per hook, take the first entry
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { root: null, rootMargin: '50% 0px', threshold: 0 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [sectionRef]);

  const shouldAnimate = shouldRunContinuousMotion({
    sectionVisible: isVisible,
    documentVisible: isDocumentVisible,
    prefersReducedMotion: isReducedMotion,
    mobile: isMobile
  });

  return {
    isVisible,
    isDocumentVisible,
    isReducedMotion,
    isMobile,
    shouldAnimate
  };
}
