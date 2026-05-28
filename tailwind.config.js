/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ADE80',
        secondary: '#1E293B',
        tertiary: '#00DCFE',
        neutral: '#0F172A',
        'neutral-light': '#1E293B',
        'neutral-mid': '#334155',
        'text-muted': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4ADE80, #00DCFE)',
        'gradient-dark': 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981, #34d399)',
        'gradient-emerald-cyan': 'linear-gradient(135deg, #10b981, #06b6d4)',
        'gradient-hero': 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 70%)',
        'mesh-dark': 'radial-gradient(at 40% 20%, rgba(16,185,129,0.07) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6,182,212,0.05) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16,185,129,0.05) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-slower': 'float 14s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'glow-pulse-slow': 'glowPulse 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'spin-slow': 'spin 20s linear infinite',
        'marquee-ltr': 'marquee-ltr 40s linear infinite',
        'marquee-rtl': 'marquee-rtl 35s linear infinite',
        'node-drift': 'nodeDrift 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 0.3s ease-out',
        'reveal': 'reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)', opacity: '0.7' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
        'marquee-ltr': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-rtl': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        nodeDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate(8px, -12px) scale(1.1)', opacity: '0.9' },
          '66%': { transform: 'translate(-6px, 8px) scale(0.9)', opacity: '0.7' },
        },
        countUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        reveal: {
          from: { opacity: 0, transform: 'translateY(24px)', filter: 'blur(4px)' },
          to: { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
        },
      },
      boxShadow: {
        'emerald-glow': '0 0 40px rgba(16, 185, 129, 0.25)',
        'emerald-glow-lg': '0 0 80px rgba(16, 185, 129, 0.3)',
        'cyan-glow': '0 0 40px rgba(6, 182, 212, 0.2)',
        'card-lift': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'card-lift-dark': '0 20px 60px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 40px 80px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'inner-glow': 'inset 0 1px 0 rgba(16, 185, 129, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
        '4xl': '96px',
      },
      blur: {
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
    },
  },
  plugins: [],
}
