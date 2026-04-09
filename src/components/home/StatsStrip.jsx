import React, { useEffect, useRef, useState } from 'react';

const stats = [
  { target: 10000, suffix: '+', label: 'Jobs', },
  { target: 500, suffix: '+', label: 'Companies', },
  { target: 100, suffix: '%', label: 'Free', },
];

function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const StatItem = ({ target, suffix, label, icon, started }) => {
  const count = useCountUp(target, 1800, started);
  const display = count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K` : count;
  return (
    <div style={{ textAlign: 'center', padding: '0 32px', position: 'relative' }}>
      {/* Divider line between items */}
      <div style={{
        position: 'absolute',
        left: 0, top: '50%',
        transform: 'translateY(-50%)',
        height: '50px', width: '1px',
        background: 'rgba(255,255,255,0.2)',
      }} />

      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>

      <p style={{
        fontSize: '42px',
        fontWeight: '900',
        lineHeight: 1,
        margin: '0 0 6px 0',
        letterSpacing: '-1px',
        color: '#ffffff',
        textShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        {display}{suffix}
      </p>
      <p style={{
        fontSize: '14px',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.85)',
        margin: 0,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}>
        {label}
      </p>
    </div>
  );
};

const StatsStrip = () => {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '48px 0',
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
      }}
    >
      {/* Dot-grid texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        pointerEvents: 'none',
      }} />

      {/* Radial glow accents */}
      <div style={{
        position: 'absolute',
        top: '-60px', left: '5%',
        width: '320px', height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px', right: '10%',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Stats */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '32px',
      }}>
        {stats.map((s) => (
          <StatItem key={s.label} {...s} started={started} />
        ))}
      </div>
    </div>
  );
};

export default StatsStrip;