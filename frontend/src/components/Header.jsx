import React from 'react';
import { Compass, PlayCircle, PlusCircle } from 'lucide-react';

export default function Header({ onLoadDemo, onOpenNewTrip, loading }) {
  return (
    <header className="site-header">
      <div className="header-content">
        
        {/* Brand & Subtitle */}
        <div className="brand-section">
          <div className="brand-icon">
            <Compass style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <div className="brand-title">
              <span>Adaptive AI Travel Planner</span>
            </div>
            <p className="brand-subtitle">
              Constraint-Aware • Continuous Real-Time Replanning • Explainable Intelligence
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="header-actions">

          {/* One-Click Hackathon Demo Preset Button */}
          <button
            onClick={onLoadDemo}
            disabled={loading}
            className="btn-primary"
            title="Load 4-Day Goa Demo Scenario (₹30,000 Budget)"
          >
            <PlayCircle style={{ width: 16, height: 16 }} />
            <span>Load Demo (Goa)</span>
          </button>

          {/* New Custom Trip */}
          <button
            onClick={onOpenNewTrip}
            className="btn-secondary"
          >
            <PlusCircle style={{ width: 16, height: 16, color: '#4f46e5' }} />
            <span>New Trip</span>
          </button>

        </div>

      </div>
    </header>
  );
}
