import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`min-h-[44px] min-w-[44px] rounded-md transition-colors duration-fast flex items-center justify-center focus-visible ${
        theme === 'dark'
          ? 'bg-surface-raised hover:bg-surface-muted text-warning'
          : 'bg-surface-raised hover:bg-surface-muted text-content-secondary hover:text-content'
      } ${className}`}
      aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
