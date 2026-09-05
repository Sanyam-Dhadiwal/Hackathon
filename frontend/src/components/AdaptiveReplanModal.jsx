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
      background: 'rgba(15, 23, 42, 0.65)',
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
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 22,
        padding: 32,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 22
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
              <Zap style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a' }}>Adaptive Replanning Result</h2>
              <p style={{ fontSize: 12, color: '#64748b' }}>Intelligent Closed-Loop Optimization • Priority Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
          >
            <X style={{ width: 22, height: 22 }} />
          </button>
        </div>

        {/* Health Score Jump Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Health Score Before</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#e11d48', marginTop: 4 }}>
              {health_score_before} <span style={{ fontSize: 14, color: '#94a3b8' }}>/ 100</span>
            </div>
            <span className="badge badge-high" style={{ marginTop: 6 }}>
              Budget Pressure
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <ArrowRight style={{ width: 24, height: 24, color: '#4f46e5' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5' }}>
              +{health_score_after - health_score_before} pts
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Health Score After</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#059669', marginTop: 4 }}>
              {health_score_after} <span style={{ fontSize: 14, color: '#94a3b8' }}>/ 100</span>
            </div>
            <span className="badge badge-success" style={{ marginTop: 6 }}>
              Feasible & Balanced
            </span>
          </div>

        </div>

        {/* Financial Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Previous Remaining Plan</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e11d48', marginTop: 4 }}>
              {currency}{previous_remaining_planned?.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>New Remaining Plan</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {currency}{new_remaining_planned?.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Savings Achieved</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
              {currency}{total_savings?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Explanation diff */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4f46e5', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>What Changed and Why?</span>
          </div>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
            {summary_explanation}
          </p>
        </div>

        {/* Itemized Modifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>
            Itemized Activity Modifications ({modifications.length} Adapted)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
            {modifications.map((mod, i) => (
              <div 
                key={i} 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 12, 
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-primary" style={{ fontSize: 10 }}>
                      Day {mod.day_number}
                    </span>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>{mod.activity_name}</strong>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                    Saved {currency}{mod.savings?.toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  <strong>Adaptation rationale:</strong> {mod.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Protected Notice */}
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#059669' }}>
          <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span>
            <strong>User Priorities Protected:</strong> Top experiences (Fort Aguada, Baga Beach, and Portuguese Heritage) were strictly preserved.
          </span>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14 }}
          >
            Acknowledge & View Updated Itinerary
          </button>
        </div>

      </div>
    </div>
  );
}
