import React, { useEffect, useRef, useState } from 'react';

const stats = [
  { target: 10000, suffix: '+', label: 'Jobs' },
  { target: 500,   suffix: '+', label: 'Companies' },
  { target: 100,   suffix: '%', label: 'Free' },
];

function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const StatItem = ({ target, suffix, label, started }) => {
  const count = useCountUp(target, 1800, started);
  const display = count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K` : count;
  return (
    <div className="text-center">
      <p className="text-2xl font-black">
        {display}{suffix}
      </p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
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
    <div ref={ref} className="bg-green-600 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-around gap-y-6 md:gap-y-0 text-center">
        {stats.map((s) => (
          <StatItem key={s.label} {...s} started={started} />
        ))}
      </div>
    </div>
  );
};

export default StatsStrip;