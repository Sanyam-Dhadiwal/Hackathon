import React from 'react';
import { Compass, Sparkles, Database, PlayCircle, PlusCircle, LogOut, User, FolderHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  systemStatus,
  onLoadDemo,
  onOpenNewTrip,
  onOpenMyTrips,
  onOpenAuth,
  tripsCount = 0,
  loading
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const dbIsCloud = systemStatus?.database?.type?.includes('Atlas');
  const aiIsGemini = systemStatus?.ai_engine?.has_gemini_key;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

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

        {/* Right Actions & User Menu */}
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

          {/* User Profile / Auth Area */}
          {isAuthenticated ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginLeft: 6,
              paddingLeft: 12,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              
              {/* My Trips Button */}
              {onOpenMyTrips && (
                <button
                  onClick={onOpenMyTrips}
                  className="btn-secondary"
                  title="View and switch between your saved trips"
                  style={{ padding: '7px 12px', fontSize: 13 }}
                >
                  <FolderHeart style={{ width: 14, height: 14, color: '#f43f5e' }} />
                  <span>My Trips ({tripsCount})</span>
                </button>
              )}

              {/* User Greeting Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }}
                title={user?.email}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  Hi, {firstName} 👋
                </span>
              </div>

              {/* Logout Action */}
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: 10,
                  padding: '8px',
                  color: '#fb7185',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
              >
                <LogOut style={{ width: 15, height: 15 }} />
              </button>

            </div>
          ) : (
            <div style={{ marginLeft: 6, paddingLeft: 12, borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={onOpenAuth}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                <User style={{ width: 15, height: 15 }} />
                <span>Sign In</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
