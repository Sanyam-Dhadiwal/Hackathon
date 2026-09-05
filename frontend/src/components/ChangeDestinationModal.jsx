import React, { useState } from 'react';
import { MapPin, X, Sparkles, ArrowRight } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { name: 'Paris', label: '🗼 Paris', desc: 'Eiffel Tower, Louvre & Seine' },
  { name: 'Tokyo', label: '⛩️ Tokyo', desc: 'Shibuya, Senso-ji & Akihabara' },
  { name: 'Jaipur', label: '🏰 Jaipur', desc: 'Amber Fort, Hawa Mahal & Bazaars' },
  { name: 'Manali', label: '🏔️ Manali', desc: 'Solang Valley, Hadimba & Waterfalls' },
  { name: 'Goa', label: '🏖️ Goa', desc: 'Baga Beach, Fort Aguada & Shacks' },
  { name: 'Kerala', label: '🌴 Kerala', desc: 'Alleppey Backwaters & Fort Kochi' },
  { name: 'New York', label: '🏙️ New York', desc: 'Central Park, Times Sq & High Line' },
  { name: 'Dubai', label: '🐪 Dubai', desc: 'Burj Khalifa, Desert Safari & Marina' },
  { name: 'Bali', label: '🏝️ Bali', desc: 'Ubud Monkeys, Rice Terraces & Uluwatu' },
  { name: 'Rome', label: '🏛️ Rome', desc: 'Colosseum, Vatican & Trevi Fountain' },
];

export default function ChangeDestinationModal({ isOpen, onClose, currentDestination, onChangeDestination, loading }) {
  const [destination, setDestination] = useState(currentDestination || 'Paris');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (destination.trim()) {
      onChangeDestination(destination.trim());
    }
  };

  const handleSelectQuick = (city) => {
    setDestination(city);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 22,
        padding: 30,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
              <MapPin style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Change Trip Destination</h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                Currently in <strong style={{ color: '#4f46e5' }}>{currentDestination}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer' }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Informative explanation banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10
        }}>
          <Sparkles style={{ width: 18, height: 18, color: '#4f46e5', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.45 }}>
            Switching destinations dynamically recalculates and updates all day-by-day places, GPS coordinates, interactive map pins, and packing checklists for the new city.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              Enter or Select New Destination
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, Tokyo, Jaipur, Manali, New York, Bali"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 14,
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Popular destination quick-pick grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
              Popular Destinations (Instant Places & Coordinates)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
              maxHeight: 180,
              overflowY: 'auto',
              paddingRight: 4
            }}>
              {POPULAR_DESTINATIONS.map((dest) => {
                const isSelected = destination.toLowerCase() === dest.name.toLowerCase();
                return (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => handleSelectQuick(dest.name)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                      background: isSelected ? '#eef2ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#4f46e5' : '#0f172a' }}>
                      {dest.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      {dest.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !destination.trim()}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>{loading ? 'Updating Places...' : 'Update Destination'}</span>
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
