import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, ChevronDown, ChevronUp, 
  CheckCircle2, Sparkles, Edit3, ArrowRightLeft, X
} from 'lucide-react';

export default function ItineraryView({ 
  days = [], 
  currency = '₹', 
  onLogExpense, 
  loading 
}) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedDayForExpense, setSelectedDayForExpense] = useState(null);
  const [actualInputAmount, setActualInputAmount] = useState('');

  if (!days || days.length === 0) return null;

  const currentDay = days[activeDayIndex] || days[0];

  const toggleExplanation = (id) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenExpenseModal = (day) => {
    setSelectedDayForExpense(day);
    setActualInputAmount(day.daily_actual_spending > 0 ? day.daily_actual_spending.toString() : '8000');
    setExpenseModalOpen(true);
  };

  const submitExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(actualInputAmount);
    if (!isNaN(amount) && amount >= 0 && selectedDayForExpense) {
      onLogExpense(selectedDayForExpense.day_number, amount);
      setExpenseModalOpen(false);
    }
  };

  return (
    <div className="premium-card">
      
      {/* Top Controls: Day Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
            <Calendar style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Daily Schedule & Experience Plan</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>Personalized Stops • Priority Preservation • Explanations</p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: 4, borderRadius: 12, border: '1px solid #e2e8f0', gap: 4 }}>
          {days.map((day, idx) => {
            const isCompleted = day.is_completed || day.daily_actual_spending > 0;
            const isActive = activeDayIndex === idx;
            return (
              <button
                key={day.day_number}
                onClick={() => setActiveDayIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? '#4f46e5' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b'
                }}
              >
                <span>Day {day.day_number}</span>
                {isCompleted && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Header Banner */}
      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: 16, 
        padding: '20px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: 16,
        marginBottom: 22 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {currentDay.title}
            </h4>
            {currentDay.is_completed ? (
              <span className="badge badge-success">
                <CheckCircle2 style={{ width: 13, height: 13 }} /> Completed Day
              </span>
            ) : (
              <span className="badge badge-primary">
                Planned Future Day
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#64748b', marginTop: 6, flexWrap: 'wrap' }}>
            <span>Date: <strong style={{ color: '#0f172a' }}>{currentDay.date}</strong></span>
            <span>•</span>
            <span>Planned Budget: <strong style={{ color: '#0f172a' }}>{currency}{currentDay.daily_planned_budget?.toLocaleString()}</strong></span>
            {currentDay.daily_actual_spending > 0 && (
              <>
                <span>•</span>
                <span>Actual Spent: <strong style={{ color: '#d97706' }}>{currency}{currentDay.daily_actual_spending?.toLocaleString()}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Record Expense Button */}
        <button
          onClick={() => handleOpenExpenseModal(currentDay)}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '9px 16px' }}
        >
          <Edit3 style={{ width: 14, height: 14, color: '#4f46e5' }} />
          <span>{currentDay.daily_actual_spending > 0 ? 'Edit Actual Spending' : 'Record Actual Spending'}</span>
        </button>
      </div>

      {/* Activity Cards List */}
      <div>
        {currentDay.activities.map((act, actIdx) => {
          const isExpanded = expandedExplanations[act.id];
          const isReplaced = act.status === 'replaced';

          return (
            <div 
              key={act.id} 
              className={`activity-card ${isReplaced ? 'replaced' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                
                {/* Left details */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ 
                    width: 34, 
                    height: 34, 
                    borderRadius: 10, 
                    background: '#eef2ff', 
                    border: '1px solid #c7d2fe', 
                    color: '#4f46e5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800, 
                    fontSize: 13,
                    flexShrink: 0 
                  }}>
                    {actIdx + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h5 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        {act.name}
                      </h5>
                      {isReplaced && (
                        <span className="badge badge-medium">
                          <ArrowRightLeft style={{ width: 12, height: 12 }} /> Adaptively Replaced
                        </span>
                      )}
                      {act.is_completed && (
                        <span className="badge badge-success">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#64748b', marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock style={{ width: 13, height: 13 }} />
                        {act.start_time} - {act.end_time} ({act.duration_hours} hrs)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin style={{ width: 13, height: 13 }} />
                        {act.location_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Cost & Priority Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>
                      {currency}{act.estimated_cost?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Estimated Cost
                    </div>
                  </div>

                  <span className={`badge ${
                    act.priority === 'HIGH' ? 'badge-high' : act.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                  }`}>
                    {act.priority} PRIORITY
                  </span>

                  <button
                    onClick={() => toggleExplanation(act.id)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6 }}
                    title="Why Recommended"
                  >
                    {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                  </button>
                </div>

              </div>

              {/* Expandable Explanation Details */}
              {isExpanded && (
                <div style={{ 
                  marginTop: 14, 
                  paddingTop: 14, 
                  borderTop: '1px solid #e2e8f0', 
                  background: '#f8fafc', 
                  borderRadius: 12, 
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4f46e5', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                    <Sparkles style={{ width: 13, height: 13 }} />
                    <span>Why Recommended & Constraint Feasibility:</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.55 }}>
                    {act.explanation}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    <span>Preference Match: <strong style={{ color: '#4f46e5' }}>{act.preference_match}</strong></span>
                    <span>•</span>
                    <span>Category: <strong style={{ color: '#0f172a' }}>{act.category}</strong></span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Log Expense Modal Dialog */}
      {expenseModalOpen && selectedDayForExpense && (
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
            maxWidth: 440,
            width: '100%',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                Record Actual Spending: Day {selectedDayForExpense.day_number}
              </h3>
              <button
                onClick={() => setExpenseModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.45 }}>
              Enter the actual amount spent on Day {selectedDayForExpense.day_number}. 
              The system will calculate variance and trigger adaptive replanning if needed.
            </p>

            <form onSubmit={submitExpense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Original Planned Budget for Day {selectedDayForExpense.day_number}
                </label>
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'monospace', color: '#334155', fontWeight: 700 }}>
                  {currency}{selectedDayForExpense.daily_planned_budget?.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                  Actual Spending Amount ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={actualInputAmount}
                  onChange={(e) => setActualInputAmount(e.target.value)}
                  placeholder="e.g. 8000"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1.5px solid #4f46e5',
                    color: '#0f172a',
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                  Tip for demo: Enter <strong style={{ color: '#d97706' }}>8000</strong> to trigger the budget variance (+₹3,000).
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '8px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  Update Trip & Evaluate
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
