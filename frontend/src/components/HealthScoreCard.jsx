import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function HealthScoreCard({ healthScore }) {
  const [showInsights, setShowInsights] = useState(true);

  if (!healthScore) return null;

  const {
    overall_score,
    budget_fit,
    preference_match,
    time_feasibility,
    travel_pace,
    activity_coverage,
    insights = {}
  } = healthScore;

  const getScoreColor = (score) => {
    if (score >= 85) return { text: '#059669', bg: '#059669', pillBg: '#ecfdf5', pillBorder: '#a7f3d0' };
    if (score >= 70) return { text: '#d97706', bg: '#d97706', pillBg: '#fffbeb', pillBorder: '#fde68a' };
    return { text: '#e11d48', bg: '#e11d48', pillBg: '#fff1f2', pillBorder: '#fecdd3' };
  };

  const overallStyle = getScoreColor(overall_score);

  const dimensions = [
    { label: 'Budget Fit', weight: '30%', score: budget_fit, key: 'Budget Fit', desc: insights['Budget Fit'] },
    { label: 'Preference Match', weight: '25%', score: preference_match, key: 'Preference Match', desc: insights['Preference Match'] },
    { label: 'Time Feasibility', weight: '20%', score: time_feasibility, key: 'Time Feasibility', desc: insights['Time Feasibility'] },
    { label: 'Travel Pace', weight: '15%', score: travel_pace, key: 'Travel Pace', desc: insights['Travel Pace'] },
    { label: 'Activity Coverage', weight: '10%', score: activity_coverage, key: 'Activity Coverage', desc: insights['Activity Coverage'] }
  ];

  return (
    <div className="premium-card">
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
            <ShieldCheck style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Trip Health Score Engine</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>Continuous Deterministic Multi-Dimensional Evaluation</p>
          </div>
        </div>

        <button
          onClick={() => setShowInsights(!showInsights)}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '7px 14px' }}
        >
          <span>{showInsights ? 'Hide Insights' : 'View Insights'}</span>
          {showInsights ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
        </button>
      </div>

      {/* Main Score & Dimensional Grid */}
      <div className="health-layout">
        
        {/* Left: Overall Circular Radial Score Display */}
        <div className="health-gauge-box">
          <div className="health-circle-wrapper">
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
              <path
                strokeWidth="3.5"
                stroke="#e2e8f0"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeDasharray={`${overall_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke={overallStyle.bg}
                fill="none"
                style={{ transition: 'all 0.6s ease' }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: overallStyle.text, lineHeight: 1 }}>
                {overall_score}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginTop: 2 }}>
                / 100
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              padding: '4px 12px', 
              borderRadius: 999, 
              border: `1px solid ${overallStyle.pillBorder}`, 
              color: overallStyle.text, 
              background: overallStyle.pillBg 
            }}>
              {overall_score >= 85 ? 'Trip in Excellent Health' : overall_score >= 70 ? 'Trip Feasible with Risk' : 'High Budget/Time Strain'}
            </span>
          </div>
        </div>

        {/* Right: 5 Dimensional Bars with generous spacing */}
        <div className="health-dimensions-list">
          {dimensions.map((dim) => {
            const barStyle = getScoreColor(dim.score);
            return (
              <div key={dim.key} className="dimension-row">
                <div className="dimension-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="dimension-name" style={{ color: '#0f172a' }}>{dim.label}</span>
                    <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>({dim.weight})</span>
                  </div>
                  <span className="dimension-score" style={{ color: barStyle.text }}>
                    {dim.score} <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>/ 100</span>
                  </span>
                </div>
                
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${dim.score}%`, background: barStyle.bg }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Expandable Deterministic Insights */}
      {showInsights && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 18, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4f46e5', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>Dimension Insights & Real-Time Reasoning</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {dimensions.map((dim) => (
              <div 
                key={dim.key} 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 14, 
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  <span>{dim.label}</span>
                  <span style={{ color: '#4f46e5', fontFamily: 'monospace' }}>{dim.score}/100</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                  {dim.desc || 'Operating within nominal bounds.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
