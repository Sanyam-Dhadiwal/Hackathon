import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiClient } from './services/apiClient';
import Header from './components/Header';
import BudgetStatusBar from './components/BudgetStatusBar';
import HealthScoreCard from './components/HealthScoreCard';
import InteractiveMap from './components/InteractiveMap';
import ItineraryView from './components/ItineraryView';
import AdaptiveReplanModal from './components/AdaptiveReplanModal';
import PackingChecklist from './components/PackingChecklist';
import NewTripModal from './components/NewTripModal';
import MyTripsModal from './components/MyTripsModal';
import AuthModal from './components/AuthModal';

import { Calendar, Map, Luggage, Compass, ShieldCheck, ArrowRight } from 'lucide-react';

function TravelPlannerContent() {
  const { isAuthenticated, isLoading } = useAuth();

  const [trips, setTrips] = useState([]);
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
  const [myTripsModalOpen, setMyTripsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // 1. Fetch system status
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

  // 2. Load budget analysis for active trip
  const fetchBudgetAnalysis = useCallback(async (tripId) => {
    try {
      const res = await apiClient.get(`/api/trips/${tripId}/budget`);
      if (res.ok) {
        const data = await res.json();
        setBudgetAnalysis(data);
      }
    } catch (err) {
      console.error('Error fetching budget analysis:', err);
    }
  }, []);

  // 3. Load demo trip
  const loadDemoTrip = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/demo/preset');
      if (res.ok) {
        const trip = await res.json();
        setActiveTrip(trip);
        setTrips((prev) => {
          const exists = prev.some((t) => t.id === trip.id);
          return exists ? prev.map((t) => (t.id === trip.id ? trip : t)) : [...prev, trip];
        });
        await fetchBudgetAnalysis(trip.id);
      }
    } catch (err) {
      console.error('Error loading demo trip:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchBudgetAnalysis]);

  // 4. Fetch all trips belonging to current authenticated user
  const fetchUserTrips = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/api/trips');
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
        if (data.length > 0) {
          setActiveTrip((prev) => {
            if (prev && data.some((t) => t.id === prev.id)) {
              return data.find((t) => t.id === prev.id);
            }
            return data[data.length - 1];
          });
        } else {
          loadDemoTrip();
        }
      }
    } catch (err) {
      console.error('Error fetching user trips:', err);
    }
  }, [isAuthenticated, loadDemoTrip]);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserTrips();
    } else {
      setTrips([]);
      setActiveTrip(null);
      setBudgetAnalysis(null);
    }
  }, [isAuthenticated, fetchUserTrips]);

  useEffect(() => {
    if (activeTrip?.id) {
      fetchBudgetAnalysis(activeTrip.id);
    }
  }, [activeTrip?.id, fetchBudgetAnalysis]);

  const handleLogExpense = async (dayNumber, actualAmount) => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      const res = await apiClient.post(`/api/trips/${activeTrip.id}/expenses`, {
        day_number: dayNumber,
        actual_amount: actualAmount,
        description: `Day ${dayNumber} actual spend entry`
      });

      if (res.ok) {
        const data = await res.json();
        setActiveTrip(data.trip);
        setTrips((prev) => prev.map((t) => (t.id === data.trip.id ? data.trip : t)));
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
      const res = await apiClient.post(`/api/trips/${activeTrip.id}/replan`);
      if (res.ok) {
        const data = await res.json();
        setActiveTrip(data.trip);
        setTrips((prev) => prev.map((t) => (t.id === data.trip.id ? data.trip : t)));
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
      const res = await apiClient.patch(`/api/trips/${activeTrip.id}/packing/${itemId}`, {
        is_packed: isPacked
      });
      if (res.ok) {
        setActiveTrip((prev) => ({
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
      const res = await apiClient.post('/api/trips', reqBody);
      if (res.ok) {
        const trip = await res.json();
        setActiveTrip(trip);
        setTrips((prev) => [...prev, trip]);
        setNewTripModalOpen(false);
        await fetchBudgetAnalysis(trip.id);
      }
    } catch (err) {
      console.error('Error creating trip:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while restoring session from HttpOnly cookie
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080c15',
        color: '#ffffff',
        gap: 18
      }}>
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 35px rgba(99, 102, 241, 0.4)'
        }}>
          <Compass style={{ width: 28, height: 28, color: '#fff' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Adaptive AI Travel Planner</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            Verifying secure session & environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Header with User Auth Menu */}
      <Header
        onLoadDemo={loadDemoTrip}
        onOpenNewTrip={() => {
          if (!isAuthenticated) setAuthModalOpen(true);
          else setNewTripModalOpen(true);
        }}
        onOpenMyTrips={() => setMyTripsModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        tripsCount={trips.length}
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          fetchUserTrips();
        }}
      />

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

      {/* My Trips Switcher Modal */}
      <MyTripsModal
        isOpen={myTripsModalOpen}
        onClose={() => setMyTripsModalOpen(false)}
        trips={trips}
        activeTripId={activeTrip?.id}
        onSelectTrip={(selected) => {
          setActiveTrip(selected);
          fetchBudgetAnalysis(selected.id);
        }}
        onOpenNewTrip={() => setNewTripModalOpen(true)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TravelPlannerContent />
    </AuthProvider>
  );
}
