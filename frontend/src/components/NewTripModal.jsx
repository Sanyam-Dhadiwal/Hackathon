import React, { useState } from 'react';
import { Compass, X } from 'lucide-react';

export default function NewTripModal({ isOpen, onClose, onCreateTrip, loading }) {
  const [destination, setDestination] = useState('Goa');
  const [durationDays, setDurationDays] = useState(4);
  const [totalBudget, setTotalBudget] = useState(30000);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [travelPace, setTravelPace] = useState('Moderate');
  const [specialConstraints, setSpecialConstraints] = useState('Avoid overly packed days; preserve cultural visits');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTrip({
      destination,
      start_date: '2026-10-15',
      end_date: '2026-10-19',
      duration_days: parseInt(durationDays),
      travelers: parseInt(travelers),
      total_budget: parseFloat(totalBudget),
      currency: '₹',
      interests: ['Beach', 'Culture', 'Food', 'Adventure'],
      priority_weights: {
        'Beach': 'HIGH',
        'Culture': 'HIGH',
        'Food': 'HIGH',
        'Adventure': 'MEDIUM',
        'Shopping': 'LOW',
        'Luxury': 'LOW'
      },
      travel_style: travelStyle,
      travel_pace: travelPace,
      special_constraints: specialConstraints
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        background: '#0e1526',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 22,
        padding: 30,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Compass style={{ width: 20, height: 20 }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Create Personalized Trip</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                Destination
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, Tokyo, Paris"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#090e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                Total Budget (₹)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#090e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 13,
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                Days
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#090e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 13
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                Travelers
              </label>
              <input
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#090e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 13
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 10,
                  background: '#090e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 12
                }}
              >
                <option value="Balanced">Balanced</option>
                <option value="Budget">Budget</option>
                <option value="Luxury">Luxury</option>
                <option value="Adventure">Adventure</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                Pace
              </label>
              <select
                value={travelPace}
                onChange={(e) => setTravelPace(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 10,
                  background: '#090e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 12
                }}
              >
                <option value="Relaxed">Relaxed (2-3)</option>
                <option value="Moderate">Moderate (3-4)</option>
                <option value="Fast-paced">Fast (4-5)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
              Special Constraints & Preferences
            </label>
            <textarea
              rows="2"
              value={specialConstraints}
              onChange={(e) => setSpecialConstraints(e.target.value)}
              placeholder="e.g. Avoid packed days, preserve cultural visits"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                background: '#090e1a',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Synthesizing...' : 'Generate Plan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
