import React from 'react';
import { Wallet, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export default function BudgetStatusBar({ budgetAnalysis, currency = '₹', onTriggerReplan, replanning }) {
  if (!budgetAnalysis) return null;

  const {
    total_budget,
    completed_actual_spending,
    remaining_budget,
    remaining_planned_spending,
    variance,
    deficit,
    is_budget_pressure
  } = budgetAnalysis;

  const spentPercent = Math.min(100, Math.round((completed_actual_spending / total_budget) * 100));

  return (
    <div>
      {/* 5 Distinct Metric Boxes with generous gaps and clear contrast */}
      <div className="metrics-grid">
        
        {/* Card 1: Total Budget */}
        <div className="metric-box">
          <div className="metric-top">
            <span>Total Budget</span>
            <Wallet style={{ width: 16, height: 16, color: '#4f46e5' }} />
          </div>
          <div className="metric-value">
            {currency}{total_budget?.toLocaleString()}
          </div>
          <div className="metric-footer">
            Total trip budget
          </div>
        </div>

        {/* Card 2: Actual Spent */}
        <div className="metric-box">
          <div className="metric-top">
            <span>Actual Spent</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: completed_actual_spending > 0 ? '#d97706' : '#64748b' }}>
              {spentPercent}% spent
            </span>
          </div>
          <div className="metric-value" style={{ color: completed_actual_spending > 0 ? '#d97706' : '#0f172a' }}>
            {currency}{completed_actual_spending?.toLocaleString()}
          </div>
          <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${spentPercent}%`, 
                background: is_budget_pressure ? '#e11d48' : '#059669',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>

        {/* Card 3: Remaining Budget */}
        <div className="metric-box">
          <div className="metric-top">
            <span>Remaining Budget</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: remaining_budget > 0 ? '#059669' : '#e11d48' }} />
          </div>
          <div className="metric-value" style={{ color: remaining_budget < 0 ? '#e11d48' : '#059669' }}>
            {currency}{remaining_budget?.toLocaleString()}
          </div>
          <div className="metric-footer">
            Cash remaining in hand
          </div>
        </div>

        {/* Card 4: Remaining Planned */}
        <div className="metric-box">
          <div className="metric-top">
            <span>Remaining Planned</span>
            {remaining_planned_spending > remaining_budget ? (
              <TrendingUp style={{ width: 16, height: 16, color: '#e11d48' }} />
            ) : (
              <TrendingDown style={{ width: 16, height: 16, color: '#059669' }} />
            )}
          </div>
          <div className="metric-value" style={{ color: remaining_planned_spending > remaining_budget ? '#e11d48' : '#0f172a' }}>
            {currency}{remaining_planned_spending?.toLocaleString()}
          </div>
          <div className="metric-footer">
            Cost of future planned stops
          </div>
        </div>

        {/* Card 5: Variance */}
        <div className="metric-box">
          <div className="metric-top">
            <span>Spending Variance</span>
            {variance > 0 ? (
              <span className="badge badge-high">Over</span>
            ) : variance < 0 ? (
              <span className="badge badge-success">Saved</span>
            ) : (
              <span className="badge badge-low">Target</span>
            )}
          </div>
          <div className="metric-value" style={{ color: variance > 0 ? '#e11d48' : variance < 0 ? '#059669' : '#0f172a' }}>
            {variance > 0 ? `+${currency}${variance.toLocaleString()}` : `${currency}${variance.toLocaleString()}`}
          </div>
          <div className="metric-footer">
            Actual vs Plan diff
          </div>
        </div>

      </div>

      {/* Alert Banners */}
      {is_budget_pressure ? (
        <div className="alert-banner-danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 10, borderRadius: 12, background: '#fee2e2', color: '#e11d48' }}>
              <AlertTriangle style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#9f1239' }}>Budget Pressure Detected</h4>
                <span className="badge badge-high">Action Required</span>
              </div>
              <p style={{ fontSize: 13, color: '#4c0519', marginTop: 4, lineHeight: 1.4 }}>
                Day 1 spending exceeded plan by <strong style={{ color: '#be123c' }}>{currency}{variance.toLocaleString()}</strong>. Remaining planned activities ({currency}{remaining_planned_spending.toLocaleString()}) exceed remaining cash ({currency}{remaining_budget.toLocaleString()}) by <strong style={{ color: '#be123c' }}>{currency}{deficit.toLocaleString()}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onTriggerReplan}
            disabled={replanning}
            className="btn-replan-pulse"
          >
            <Zap style={{ width: 16, height: 16, fill: '#ffffff', color: '#ffffff' }} />
            <span>{replanning ? 'Adaptively Replanning...' : 'Adaptively Replan Remaining Days'}</span>
          </button>
        </div>
      ) : (
        <div className="alert-banner-success">
          <div style={{ padding: 8, borderRadius: 10, background: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 style={{ width: 18, height: 18 }} />
          </div>
          <p style={{ fontSize: 13, color: '#065f46' }}>
            <strong style={{ color: '#047857' }}>Itinerary Financially Feasible:</strong> Remaining planned spending of {currency}{remaining_planned_spending.toLocaleString()} safely fits within your {currency}{remaining_budget.toLocaleString()} available funds.
          </p>
        </div>
      )}
    </div>
  );
}
