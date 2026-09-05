import React from 'react';
import { CheckSquare, Square, Luggage } from 'lucide-react';

export default function PackingChecklist({ items = [], onToggleItem, loading }) {
  if (!items || items.length === 0) return null;

  const totalItems = items.length;
  const packedItems = items.filter(i => i.is_packed).length;
  const progressPercent = Math.round((packedItems / totalItems) * 100);

  const categories = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="premium-card">
      
      {/* Header & Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Luggage style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Destination-Customized Packing Checklist</h3>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Tailored to Climate, Coastal Activities & Travel Pace</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 140, height: 8, background: '#18233c', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #10b981)',
                borderRadius: 999,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', minWidth: 40 }}>
            {packedItems}/{totalItems} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Category Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {Object.entries(categories).map(([category, catItems]) => (
          <div 
            key={category} 
            style={{ 
              background: '#0a0f1d', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: 16, 
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
              <span>{category}</span>
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                {catItems.filter(i => i.is_packed).length}/{catItems.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              {catItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onToggleItem(item.id, !item.is_packed)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                    gap: 12
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.is_packed ? (
                      <CheckSquare style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0 }} />
                    ) : (
                      <Square style={{ width: 16, height: 16, color: '#64748b', flexShrink: 0 }} />
                    )}
                    <span style={{ 
                      fontSize: 13, 
                      color: item.is_packed ? '#64748b' : '#f8fafc',
                      textDecoration: item.is_packed ? 'line-through' : 'none'
                    }}>
                      {item.item_name}
                    </span>
                  </div>

                  {item.is_essential && (
                    <span style={{ 
                      fontSize: 10, 
                      fontWeight: 700, 
                      padding: '2px 7px', 
                      borderRadius: 6, 
                      background: 'rgba(245, 158, 11, 0.15)', 
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      flexShrink: 0
                    }}>
                      Essential
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
