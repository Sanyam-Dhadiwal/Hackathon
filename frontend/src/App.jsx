import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BudgetStatusBar from './components/BudgetStatusBar';
import HealthScoreCard from './components/HealthScoreCard';
import InteractiveMap from './components/InteractiveMap';
import ItineraryView from './components/ItineraryView';
import AdaptiveReplanModal from './components/AdaptiveReplanModal';
import PackingChecklist from './components/PackingChecklist';
import NewTripModal from './components/NewTripModal';

import { Calendar, Map, Luggage } from 'lucide-react';

export default function App() {
  const [activeTrip, setActiveTrip] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replanning, setReplanning] = useState(false);
  
  // Navigation: 'itinerary' | 'map' | 'packing'
  const [activeTab, setActiveTab] = useState('itinerary');
  const [replanModalOpen, setReplanModalOpen] = useState(false);
  const [latestReplanResult, setLatestReplanResult] = useState(null);
  const [newTripModalOpen, setNewTripModalOpen] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
    loadDemoTrip();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
    }
  };

  const loadDemoTrip = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/preset', { method: 'POST' });
      if (res.ok) {
        const trip = await res.json();
        setActiveTrip(trip);
        await fetchBudgetAnalysis(trip.id);
      }
    } catch (err) {
      console.error('Error loading demo trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetAnalysis = async (tripId) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/budget`);
      if (res.ok) {
        const data = await res.json();
        setBudgetAnalysis(data);
      }
    } catch (err) {
      console.error('Error fetching budget analysis:', err);
    }
  };

  const handleLogExpense = async (dayNumber, actualAmount) => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_number: dayNumber,
          actual_amount: actualAmount,
          description: `Day ${dayNumber} actual spend entry`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveTrip(data.trip);
        await fetchBudgetAnalysis(activeTrip.id);
      }
    } catch (err) {
      console.error('Error recording expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReplan = async () => {
    if (!activeTrip) return;
    setReplanning(true);
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/replan`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActiveTrip(data.trip);
        setLatestReplanResult(data.replan_result);
        setReplanModalOpen(true);
        await fetchBudgetAnalysis(activeTrip.id);
      }
    } catch (err) {
      console.error('Error executing replan:', err);
    } finally {
      setReplanning(false);
    }
  };

  const handleTogglePackingItem = async (itemId, isPacked) => {
    if (!activeTrip) return;
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/packing/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_packed: isPacked })
      });
      if (res.ok) {
        setActiveTrip(prev => ({
          ...prev,
          packing_checklist: (prev.packing_checklist || []).map(item =>
            item.id === itemId ? { ...item, is_packed: isPacked } : item
          )
        }));
      }
    } catch (err) {
      console.error('Error toggling packing item:', err);
    }
  };

  const handleCreateTrip = async (reqBody) => {
    setLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });
      if (res.ok) {
        const trip = await res.json();
        setActiveTrip(trip);
        setNewTripModalOpen(false);
        await fetchBudgetAnalysis(trip.id);
      }
    } catch (err) {
      console.error('Error creating trip:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Header */}
      <Header
        systemStatus={systemStatus}
        onLoadDemo={loadDemoTrip}
        onOpenNewTrip={() => setNewTripModalOpen(true)}
        loading={loading || replanning}
      />

      {/* Main Centered App Container */}
      <main className="app-container">
        
        {/* Active Journey Hero Card */}
        {activeTrip && (
          <section className="hero-card">
            <div className="hero-header">
              
              <div className="hero-title-area">
                <div className="hero-tag">
                  <span style={{ color: '#059669', fontSize: 12 }}>●</span>
                  <span>Active Journey</span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span>{activeTrip.travelers} Travelers ({activeTrip.travel_style} • {activeTrip.travel_pace} Pace)</span>
                </div>
                
                <h1 className="hero-title">
                  {activeTrip.title}
                </h1>
                
                <div className="hero-chips">
                  {activeTrip.interests.map((interest) => (
                    <span key={interest} className="badge badge-primary">
                      {interest} • {activeTrip.priority_weights?.[interest] || 'MED'} Priority
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Trip KPI Strip in Hero */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Total Budget</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {activeTrip.currency}{activeTrip.total_budget?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 28, background: '#e2e8f0' }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Health Score</div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 900, 
                      color: (activeTrip.health_score?.overall_score || 0) >= 85 ? '#059669' : '#d97706' 
                    }}>
                      {activeTrip.health_score?.overall_score || 0}/100
                    </div>
                  </div>
                </div>

                {budgetAnalysis?.is_budget_pressure && (
                  <button
                    onClick={handleTriggerReplan}
                    disabled={replanning}
                    className="btn-replan-pulse"
                    style={{ padding: '10px 18px', fontSize: 12 }}
                  >
                    <span>⚡ {replanning ? 'Replanning...' : 'Replan Budget Pressure'}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Authoritative Single Tab Navigation Bar */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 18, marginTop: 4 }}>
              <div className="main-tab-bar">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`nav-pill-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
                >
                <Calendar style={{ width: 16, height: 16 }} />
                <span>Day-by-Day Schedule</span>
              </button>
              
              <button
                onClick={() => setActiveTab('map')}
                className={`nav-pill-btn ${activeTab === 'map' ? 'active' : ''}`}
                style={{ fontSize: 13, padding: '10px 20px' }}
              >
                <Map style={{ width: 16, height: 16 }} />
                <span>Interactive Route Map</span>
              </button>

              <button
                onClick={() => setActiveTab('packing')}
                className={`nav-pill-btn ${activeTab === 'packing' ? 'active' : ''}`}
                style={{ fontSize: 13, padding: '10px 20px' }}
              >
                <Luggage style={{ width: 16, height: 16 }} />
                <span>Packing Checklist</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`nav-pill-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                style={{ fontSize: 13, padding: '10px 20px' }}
              >
                <span>📊 Budget & Health Engine</span>
              </button>
            </div>
          </div>

          </section>
        )}

        {/* Dynamic View Rendering: Each view opens immediately right at the top */}
        {activeTrip && (
          <>
            {/* VIEW 1: DAY-BY-DAY SCHEDULE & EXPENSES */}
            {activeTab === 'itinerary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Budget Pressure Alert Banner directly inside Itinerary view for quick action */}
                {budgetAnalysis?.is_budget_pressure && (
                  <div className="alert-banner-danger">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 22 }}>⚠️</span>
                      <div>
                        <strong style={{ color: '#9f1239', fontSize: 14 }}>Budget Pressure Detected (+{activeTrip.currency}{budgetAnalysis.variance?.toLocaleString()} Over Plan)</strong>
                        <p style={{ fontSize: 12, color: '#4c0519', marginTop: 2 }}>
                          Day 1 actual spend exceeded the plan. Remaining planned stops exceed available budget. Replan to restore feasibility.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTriggerReplan}
                      disabled={replanning}
                      className="btn-replan-pulse"
                      style={{ padding: '9px 18px', fontSize: 12 }}
                    >
                      <span>{replanning ? 'Replanning...' : '⚡ Adaptively Replan Remaining Days'}</span>
                    </button>
                  </div>
                )}

                <ItineraryView
                  days={activeTrip.days}
                  currency={activeTrip.currency}
                  onLogExpense={handleLogExpense}
                  loading={loading}
                />
              </div>
            )}

            {/* VIEW 2: INTERACTIVE MAP ROUTE DIRECTLY AT TOP */}
            {activeTab === 'map' && (
              <InteractiveMap
                days={activeTrip.days}
                currency={activeTrip.currency}
              />
            )}

            {/* VIEW 3: PACKING CHECKLIST DIRECTLY AT TOP */}
            {activeTab === 'packing' && (
              <PackingChecklist
                items={activeTrip.packing_checklist}
                onToggleItem={handleTogglePackingItem}
                loading={loading}
              />
            )}

            {/* VIEW 4: DEEP BUDGET & HEALTH ENGINE ANALYTICS */}
            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Budget Metrics Bar */}
                <section>
                  <div className="section-header">
                    <span className="section-title">Trip Budget & Spending Analytics</span>
                    <span className="section-subtitle">Deterministic Calculations</span>
                  </div>
                  <BudgetStatusBar
                    budgetAnalysis={budgetAnalysis}
                    currency={activeTrip?.currency || '₹'}
                    onTriggerReplan={handleTriggerReplan}
                    replanning={replanning}
                  />
                </section>

                {/* Health Score Engine */}
                <section>
                  <div className="section-header">
                    <span className="section-title">Trip Health Score Engine</span>
                    <span className="section-subtitle">Multi-Dimensional Continuous Feasibility</span>
                  </div>
                  <HealthScoreCard healthScore={activeTrip?.health_score} />
                </section>

              </div>
            )}
          </>
        )}

      </main>

      {/* Adaptive Replanning Diff Modal ("What Changed and Why") */}
      <AdaptiveReplanModal
        isOpen={replanModalOpen}
        onClose={() => setReplanModalOpen(false)}
        replanResult={latestReplanResult}
        currency={activeTrip?.currency || '₹'}
      />

      {/* New Trip Creation Modal */}
      <NewTripModal
        isOpen={newTripModalOpen}
        onClose={() => setNewTripModalOpen(false)}
        onCreateTrip={handleCreateTrip}
        loading={loading}
      />

    </div>
  );
}
