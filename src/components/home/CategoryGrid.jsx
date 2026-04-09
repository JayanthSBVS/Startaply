import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { name: 'IT & Software Jobs',      emoji: '💻', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Non-IT Jobs',             emoji: '🏢', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Government Jobs',         emoji: '🏛️', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Warehouse & Logistics',   emoji: '📦', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Gig & Flexible Work',     emoji: '⚡', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Job Drives',              emoji: '🎯', color: '#16a34a', bg: '#f0fdf4' },
];

const CategoryGrid = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleClick = (catName) => {
    if (onSelect) onSelect(catName);
    navigate(`/category/${encodeURIComponent(catName)}`);
  };

  return (
    <section style={{
      padding: '40px 0',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', textAlign: 'center' }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px',
            }}>
              Explore by Category
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Browse jobs across popular industries
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <div
              key={c.name}
              onClick={() => handleClick(c.name)}
              style={{
                background: '#ffffff',
                border: '1px solid #e8edf3',
                borderRadius: '12px',
                padding: '16px 12px',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${c.color}22`;
                e.currentTarget.style.borderColor = c.color + '55';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e8edf3';
              }}
            >


              {/* Icon Badge */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: c.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                {c.emoji}
              </div>

              {/* Text */}
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 3px 0',
                  lineHeight: '1.3',
                }}>
                  {c.name}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: c.color,
                  margin: 0,
                  fontWeight: '500',
                }}>
                  Explore →
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;