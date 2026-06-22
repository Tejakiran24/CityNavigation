import React from 'react';

export default function Legend() {
  const legendItems = [
    { label: 'Start Intersection', color: '#16a34a', type: 'node' },
    { label: 'Destination Intersection', color: '#dc2626', type: 'node' },
    { label: 'Inspected Intersection', color: '#2563eb', type: 'node' },
    { label: 'Normal Flow (Clear)', color: '#16a34a', type: 'road' },
    { label: 'Moderate Delays', color: '#f59e0b', type: 'road' },
    { label: 'Heavy Delays', color: '#dc2626', type: 'road' },
    { label: 'Gridlock (Jammed)', color: '#991b1b', type: 'road' },
    { label: 'Calculated Route', color: '#2563eb', type: 'path' },
    { label: 'Optimal Grid Backbone', color: '#475569', type: 'mst' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-clean)', paddingBottom: '8px', color: 'var(--color-text-primary)' }}>
        Map Visual Guide
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px' }}>
        {legendItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {item.type === 'node' && (
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: item.color
              }} />
            )}
            {item.type === 'road' && (
              <div style={{
                width: '24px',
                height: '5px',
                borderRadius: '2px',
                backgroundColor: item.color
              }} />
            )}
            {item.type === 'path' && (
              <div style={{
                width: '24px',
                height: '5px',
                borderRadius: '2px',
                backgroundColor: item.color,
                border: '1px solid #ffffff'
              }} />
            )}
            {item.type === 'mst' && (
              <div style={{
                width: '24px',
                height: '6px',
                borderRadius: '2px',
                backgroundColor: item.color
              }} />
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
