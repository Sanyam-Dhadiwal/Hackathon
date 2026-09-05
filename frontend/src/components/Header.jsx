import React from 'react';
import { Compass, Sparkles, Database, PlayCircle, PlusCircle, ExternalLink } from 'lucide-react';

export default function Header({ systemStatus, onLoadDemo, onOpenNewTrip, onOpenMongoModal, loading }) {
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
          
          {/* MongoDB Atlas Cloud Connection Button */}
          <button
            onClick={onOpenMongoModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 10,
              background: dbIsCloud ? '#ecfdf5' : '#ffffff',
              border: `1.5px solid ${dbIsCloud ? '#10b981' : '#cbd5e1'}`,
              color: dbIsCloud ? '#065f46' : '#1e293b',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title="Configure MongoDB Atlas Cloud Connection"
          >
            <Database style={{ width: 15, height: 15, color: dbIsCloud ? '#059669' : '#059669' }} />
            <span style={{ fontWeight: 800 }}>{dbIsCloud ? '🍃 MongoDB Atlas (Live Cloud)' : '🍃 Connect MongoDB Atlas'}</span>
          </button>

          {/* AI Engine Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 12,
            fontWeight: 700,
            color: '#475569'
          }}>
            <Sparkles style={{ width: 14, height: 14, color: '#4f46e5' }} />
            <span>{aiIsGemini ? 'Gemini 2.0 AI' : 'Curated Intelligence'}</span>
          </div>

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
