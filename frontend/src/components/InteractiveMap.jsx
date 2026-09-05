import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

const DAY_COLORS = [
  '#3b82f6', // Day 1: Blue
  '#10b981', // Day 2: Emerald
  '#f59e0b', // Day 3: Amber
  '#8b5cf6', // Day 4: Purple
  '#ec4899', // Day 5: Pink
];

export default function InteractiveMap({ days = [], currency = '₹' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [selectedDay, setSelectedDay] = useState('ALL');

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialMap = L.map(mapContainerRef.current, {
        center: [15.4989, 73.8278],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });

      // Sleek modern CartoDB Voyager tile layer (100% Free, no API key required)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(initialMap);

      mapInstanceRef.current = initialMap;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers & polylines when days or selectedDay changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !days.length) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    polylinesRef.current.forEach(p => map.removeLayer(p));
    polylinesRef.current = [];

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    days.forEach((day) => {
      if (selectedDay !== 'ALL' && selectedDay !== day.day_number) {
        return;
      }

      const dayColor = DAY_COLORS[(day.day_number - 1) % DAY_COLORS.length];
      const routePoints = [];

      day.activities.forEach((act, actIdx) => {
        if (!act.latitude || !act.longitude) return;

        const pos = [act.latitude, act.longitude];
        routePoints.push(pos);
        bounds.extend(pos);
        hasPoints = true;

        const isReplaced = act.status === 'replaced';
        const pinIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background: ${isReplaced ? '#f59e0b' : dayColor};
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="
                transform: rotate(45deg);
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                font-family: sans-serif;
              ">${day.day_number}.${actIdx + 1}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker(pos, { icon: pinIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 240px; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: ${dayColor}22; color: ${dayColor}; border: 1px solid ${dayColor}55; padding: 2px 8px; border-radius: 6px;">
                Day ${day.day_number} • Stop ${actIdx + 1}
              </span>
              <span style="font-size: 12px; font-weight: 800; color: #10b981;">
                ${currency}${act.estimated_cost?.toLocaleString()}
              </span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #f8fafc;">
              ${act.name}
            </h4>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
              📍 ${act.location_name || 'Destination Point'} (${act.start_time} - ${act.end_time})
            </div>
            ${act.status === 'replaced' ? `
              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 4px 8px; margin-bottom: 8px;">
                <span style="font-size: 10px; font-weight: 700; color: #fbbf24;">⚡ Adaptively Replaced for Budget</span>
              </div>
            ` : ''}
            <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
              <strong>Why Recommended:</strong> ${act.explanation || 'Matches user preferences.'}
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      if (routePoints.length > 1) {
        const polyline = L.polyline(routePoints, {
          color: dayColor,
          weight: 3.5,
          opacity: 0.8,
          dashArray: '6, 8'
        }).addTo(map);
        polylinesRef.current.push(polyline);
      }
    });

    if (hasPoints) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [days, selectedDay, currency]);

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-xl flex flex-col space-y-5">
      
      {/* Map Header with Day Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Geographic Route & Activity Map</h3>
            <p className="text-xs text-slate-400">OpenStreetMap Engine • Interactive Pins & Daily Itinerary Paths</p>
          </div>
        </div>

        {/* Filter by Day */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDay === 'ALL'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Stops
          </button>
          {days.map((d) => (
            <button
              key={d.day_number}
              onClick={() => setSelectedDay(d.day_number)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDay === d.day_number
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Day {d.day_number}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas with generous height */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

    </div>
  );
}
