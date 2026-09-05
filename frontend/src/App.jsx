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
  
  // Navigation
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
          packing_checklist: prev.packing_checklist.map(item =>
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
                  <span>● Active Journey</span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span>{activeTrip.travelers} Travelers ({activeTrip.travel_style} • {activeTrip.travel_pace} Pace)</span>
                </div>
                
                <h1 className="hero-title">
                  {activeTrip.title}
                </h1>
                
                <div className="hero-chips">
                  {activeTrip.interests.map((interest) => (
                    <span key={interest} className="badge badge-primary">
                      {interest} • {activeTrip.priority_weights?.[interest] || 'MED'}
                    </span>
                  ))}
                </div>
              </div>

              {/* View Switcher Pills */}
              <div className="nav-pills">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`nav-pill-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
                >
                  <Calendar style={{ width: 16, height: 16 }} />
                  <span>Itinerary</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('map')}
                  className={`nav-pill-btn ${activeTab === 'map' ? 'active' : ''}`}
                >
                  <Map style={{ width: 16, height: 16 }} />
                  <span>Map Route</span>
                </button>

                <button
                  onClick={() => setActiveTab('packing')}
                  className={`nav-pill-btn ${activeTab === 'packing' ? 'active' : ''}`}
                >
                  <Luggage style={{ width: 16, height: 16 }} />
                  <span>Packing List</span>
                </button>
              </div>

            </div>
          </section>
        )}

        {/* Section 1: Financial & Deterministic Status Bar */}
        <section>
          <div className="section-header">
            <span className="section-title">Trip Budget & Spending Analytics</span>
            <span className="section-subtitle">Deterministic Math Engine</span>
          </div>
          <BudgetStatusBar
            budgetAnalysis={budgetAnalysis}
            currency={activeTrip?.currency || '₹'}
            onTriggerReplan={handleTriggerReplan}
            replanning={replanning}
          />
        </section>

        {/* Section 2: Trip Health Score Engine Display */}
        <section>
          <div className="section-header">
            <span className="section-title">Trip Health Score Engine</span>
            <span className="section-subtitle">Continuous Multi-Dimensional Feasibility</span>
          </div>
          <HealthScoreCard healthScore={activeTrip?.health_score} />
        </section>

        {/* Section 3: Dynamic Tab Views */}
        <section>
          {activeTrip && (
            <>
              {activeTab === 'itinerary' && (
                <ItineraryView
                  days={activeTrip.days}
                  currency={activeTrip.currency}
                  onLogExpense={handleLogExpense}
                  loading={loading}
                />
              )}

              {activeTab === 'map' && (
                <InteractiveMap
                  days={activeTrip.days}
                  currency={activeTrip.currency}
                />
              )}

              {activeTab === 'packing' && (
                <PackingChecklist
                  items={activeTrip.packing_checklist}
                  onToggleItem={handleTogglePackingItem}
                  loading={loading}
                />
              )}
            </>
          )}
        </section>

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
