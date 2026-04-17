import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
      } ${className}`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
