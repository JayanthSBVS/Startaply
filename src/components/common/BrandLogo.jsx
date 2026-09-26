import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Official Startaply Brand Logo Component
 * 
 * @param {'horizontal' | 'vertical' | 'mark'} variant - The logo layout variant
 * @param {string} className - Additional CSS classes
 * @param {number|string} height - Height of the logo (default: 36 for horizontal, 56 for vertical)
 * @param {boolean} forceTheme - 'light' | 'dark' | null (auto-detects from ThemeContext)
 */
const BrandLogo = ({
  variant = 'horizontal',
  className = '',
  height,
  forceTheme = null,
  alt = 'Startaply'
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const darkMode = forceTheme ? forceTheme === 'dark' : isDark;

  if (variant === 'vertical') {
    const src = darkMode ? '/logo_vertical_dark.svg' : '/logo_vertical.svg';
    const h = height || 64;
    return (
      <img
        src={src}
        alt={alt}
        className={`object-contain transition-opacity duration-300 ${className}`}
        style={{ height: typeof h === 'number' ? `${h}px` : h, width: 'auto' }}
        loading="eager"
      />
    );
  }

  if (variant === 'mark') {
    const src = darkMode ? '/logo-short-dark.svg' : '/logo-short.svg';
    const h = height || 36;
    return (
      <img
        src={src}
        alt={alt}
        className={`object-contain transition-opacity duration-300 ${className}`}
        style={{ height: typeof h === 'number' ? `${h}px` : h, width: 'auto' }}
        loading="eager"
      />
    );
  }

  // Default: Horizontal logo
  const src = darkMode ? '/logo_horizontal_dark.svg' : '/logo_horizontal.svg';
  const h = height || 36;
  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain transition-opacity duration-300 ${className}`}
      style={{ height: typeof h === 'number' ? `${h}px` : h, width: 'auto' }}
      loading="eager"
    />
  );
};

export default BrandLogo;
