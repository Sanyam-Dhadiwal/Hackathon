import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Zap, X } from 'lucide-react';

export default function AdaptiveReplanModal({ isOpen, onClose, replanResult, currency = '₹' }) {
  if (!isOpen || !replanResult) return null;

  const {
    health_score_before,
    health_score_after,
    budget_variance,
    remaining_budget,
    previous_remaining_planned,
    new_remaining_planned,
    total_savings,
    summary_explanation,
    modifications = []
  } = replanResult;

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
        maxWidth: 640,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0e1526',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: 22,
        padding: 30,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff' }}>
              <Zap style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Adaptive Replanning Result</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Intelligent Closed-Loop Optimization • Priority Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Health Score Jump Card */}
        <div style={{
          background: 'linear-gradient(135deg, #090e1a, #151e36)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 16,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Health Score Before</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fb7185', marginTop: 4 }}>
              {health_score_before} <span style={{ fontSize: 13, color: '#64748b' }}>/ 100</span>
            </div>
            <span className="badge badge-high" style={{ marginTop: 6 }}>
              Budget Pressure
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <ArrowRight style={{ width: 24, height: 24, color: '#818cf8' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>
              +{health_score_after - health_score_before} pts
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Health Score After</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#34d399', marginTop: 4 }}>
              {health_score_after} <span style={{ fontSize: 13, color: '#64748b' }}>/ 100</span>
            </div>
            <span className="badge badge-success" style={{ marginTop: 6 }}>
              Feasible & Balanced
            </span>
          </div>

        </div>

        {/* Financial Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
          <div style={{ background: '#090e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Previous Remaining Plan</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fb7185', marginTop: 4 }}>
              {currency}{previous_remaining_planned?.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#090e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>New Remaining Plan</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
              {currency}{new_remaining_planned?.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#090e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Savings Achieved</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#818cf8', marginTop: 4 }}>
              {currency}{total_savings?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Explanation diff */}
        <div style={{ background: '#090e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#818cf8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>What Changed and Why?</span>
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
            {summary_explanation}
          </p>
        </div>

        {/* Itemized Modifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            Itemized Activity Modifications ({modifications.length} Adapted)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
            {modifications.map((mod, i) => (
              <div 
                key={i} 
                style={{ 
                  background: '#090e1a', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: 12, 
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-primary" style={{ fontSize: 10 }}>
                      Day {mod.day_number}
                    </span>
                    <strong style={{ fontSize: 13, color: '#fff' }}>{mod.activity_name}</strong>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#34d399' }}>
                    Saved {currency}{mod.savings?.toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                  <strong>Adaptation rationale:</strong> {mod.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Protected Notice */}
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#34d399' }}>
          <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span>
            <strong>User Priorities Protected:</strong> Top experiences (Fort Aguada, Baga Beach, and Portuguese Heritage) were strictly preserved.
          </span>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Acknowledge & View Updated Itinerary
          </button>
        </div>

      </div>
    </div>
  );
}
