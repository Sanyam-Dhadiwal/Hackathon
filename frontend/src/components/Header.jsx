import React from 'react';
import { Compass, Sparkles, Database, PlayCircle, PlusCircle } from 'lucide-react';

export default function Header({ systemStatus, onLoadDemo, onOpenNewTrip, loading }) {
  const dbIsCloud = systemStatus?.database?.type?.includes('Atlas');
  const aiIsGemini = systemStatus?.ai_engine?.has_gemini_key;

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
              <span className="brand-badge">Hackathon Demo</span>
            </div>
            <p className="brand-subtitle">
              Constraint-Aware • Continuous Real-Time Replanning • Explainable Intelligence
            </p>
          </div>
        </div>

        {/* Right Actions & Badges */}
        <div className="header-actions">
          
          <div className="badge badge-low" style={{ padding: '6px 12px', background: '#121a2d' }}>
            <Database style={{ width: 14, height: 14, color: '#34d399' }} />
            <span>{dbIsCloud ? 'MongoDB Atlas' : 'MongoDB Local'}</span>
          </div>

          <div className="badge badge-low" style={{ padding: '6px 12px', background: '#121a2d' }}>
            <Sparkles style={{ width: 14, height: 14, color: '#38bdf8' }} />
            <span>{aiIsGemini ? 'Gemini 2.0 AI' : 'Curated Intelligence'}</span>
          </div>

          <button
            onClick={onLoadDemo}
            disabled={loading}
            className="btn-primary"
            title="Load 4-Day Goa Demo Scenario (₹30,000 Budget)"
          >
            <PlayCircle style={{ width: 16, height: 16 }} />
            <span>Load Demo (Goa)</span>
          </button>

          <button
            onClick={onOpenNewTrip}
            className="btn-secondary"
          >
            <PlusCircle style={{ width: 16, height: 16, color: '#818cf8' }} />
            <span>New Trip</span>
          </button>

        </div>

      </div>
    </header>
  );
}
