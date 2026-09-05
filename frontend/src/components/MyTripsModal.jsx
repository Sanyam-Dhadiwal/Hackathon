import React from 'react';
import { FolderHeart, Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react';

export default function MyTripsModal({
  isOpen,
  onClose,
  trips = [],
  activeTripId,
  onSelectTrip,
  onOpenNewTrip
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1050,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        maxWidth: 620,
        width: '100%',
        maxHeight: '85vh',
        background: '#0e1526',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 22,
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 12, background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <FolderHeart style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>My Saved Trips</h3>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Switch between your personalized travel plans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Trips List */}
        <div style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          paddingRight: 4
        }}>
          {trips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <p style={{ fontSize: 15, color: '#e2e8f0', fontWeight: 600 }}>No saved trips found</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Create your first personalized trip or load the demo preset.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewTrip();
                }}
                className="btn-primary"
                style={{ marginTop: 16 }}
              >
                Create New Trip
              </button>
            </div>
          ) : (
            trips.map((trip) => {
              const isActive = trip.id === activeTripId;
              const score = trip.health_score?.overall_score || 85;

              return (
                <div
                  key={trip.id}
                  onClick={() => {
                    onSelectTrip(trip);
                    onClose();
                  }}
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : '#0a0f1d',
                    border: `1px solid ${isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 16,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        {trip.title || `${trip.destination} Trip`}
                      </span>
                      {isActive && (
                        <span className="badge badge-primary" style={{ fontSize: 10 }}>
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin style={{ width: 12, height: 12, color: '#38bdf8' }} />
                        {trip.destination}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar style={{ width: 12, height: 12, color: '#818cf8' }} />
                        {trip.duration_days} Days
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign style={{ width: 12, height: 12, color: '#34d399' }} />
                        {trip.currency}{trip.total_budget?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Health</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: score >= 80 ? '#34d399' : '#fbbf24' }}>
                        {score}/100
                      </div>
                    </div>
                    <ArrowRight style={{ width: 16, height: 16, color: '#64748b' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
