import React from 'react';
import { CheckSquare, Square, Luggage } from 'lucide-react';

const DEFAULT_PACKING_ITEMS = [
  // Clothing
  { id: 'p1', category: 'Clothing', item_name: 'Lightweight breathable cotton shirts & linen', is_packed: false, is_essential: true },
  { id: 'p2', category: 'Clothing', item_name: 'Swimwear & coastal beach cover-up', is_packed: false, is_essential: true },
  { id: 'p3', category: 'Clothing', item_name: 'Comfortable walking sandals & sneakers', is_packed: false, is_essential: true },
  { id: 'p4', category: 'Clothing', item_name: 'Smart casual evening attire for dining', is_packed: false, is_essential: false },
  { id: 'p5', category: 'Clothing', item_name: 'Light jacket or breathable windbreaker', is_packed: false, is_essential: false },
  // Documents
  { id: 'p6', category: 'Documents', item_name: 'Government ID / Driver\'s License for vehicle rental', is_packed: false, is_essential: true },
  { id: 'p7', category: 'Documents', item_name: 'Hotel bookings & digital flight passes', is_packed: false, is_essential: true },
  { id: 'p8', category: 'Documents', item_name: 'Emergency cash (INR) & 2 payment cards', is_packed: false, is_essential: true },
  // Toiletries & Health
  { id: 'p9', category: 'Toiletries & Health', item_name: 'High SPF reef-safe sunscreen (SPF 50+)', is_packed: false, is_essential: true },
  { id: 'p10', category: 'Toiletries & Health', item_name: 'Insect & mosquito repellent spray', is_packed: false, is_essential: true },
  { id: 'p11', category: 'Toiletries & Health', item_name: 'Personal first aid & electrolyte sachets', is_packed: false, is_essential: true },
  { id: 'p12', category: 'Toiletries & Health', item_name: 'Aloe vera soothing gel for sun relief', is_packed: false, is_essential: false },
  // Tech & Gear
  { id: 'p13', category: 'Tech & Gear', item_name: 'Power bank (10,000mAh+) & phone cables', is_packed: false, is_essential: true },
  { id: 'p14', category: 'Tech & Gear', item_name: 'Waterproof phone pouch for beach sports', is_packed: false, is_essential: true },
  { id: 'p15', category: 'Tech & Gear', item_name: 'Polarized UV sunglasses', is_packed: false, is_essential: true },
  { id: 'p16', category: 'Tech & Gear', item_name: 'Quick-dry microfibre travel towel', is_packed: false, is_essential: false }
];

export default function PackingChecklist({ items = [], onToggleItem, loading }) {
  // Guarantee items are never null or empty so tab ALWAYS opens
  const displayItems = (items && items.length > 0) ? items : DEFAULT_PACKING_ITEMS;

  const totalItems = displayItems.length;
  const packedItems = displayItems.filter(i => i.is_packed).length;
  const progressPercent = Math.round((packedItems / totalItems) * 100);

  const categories = displayItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="premium-card">
      
      {/* Header & Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 18, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
            <Luggage style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Destination-Customized Packing Checklist</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>Tailored to Climate, Coastal Activities & Travel Pace</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 140, height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f46e5, #059669)',
                borderRadius: 999,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', minWidth: 44 }}>
            {packedItems}/{totalItems} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Category Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20 }}>
        {Object.entries(categories).map(([category, catItems]) => (
          <div 
            key={category} 
            style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: 16, 
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <span>{category}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                {catItems.filter(i => i.is_packed).length}/{catItems.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    background: item.is_packed ? '#f1f5f9' : '#ffffff',
                    border: '1px solid',
                    borderColor: item.is_packed ? '#e2e8f0' : '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    gap: 12
                  }}
                  onMouseEnter={(e) => {
                    if (!item.is_packed) e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    if (!item.is_packed) e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.is_packed ? (
                      <CheckSquare style={{ width: 16, height: 16, color: '#059669', flexShrink: 0 }} />
                    ) : (
                      <Square style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} />
                    )}
                    <span style={{ 
                      fontSize: 13, 
                      fontWeight: 600,
                      color: item.is_packed ? '#94a3b8' : '#1e293b',
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
                      background: '#fffbeb', 
                      color: '#d97706',
                      border: '1px solid #fef3c7',
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
