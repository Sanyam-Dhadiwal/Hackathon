import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

const DAY_COLORS = [
  '#4f46e5', // Day 1: Primary Indigo
  '#0284c7', // Day 2: Sky Blue
  '#059669', // Day 3: Emerald
  '#7c3aed', // Day 4: Violet
  '#0891b2', // Day 5: Teal
];

export default function InteractiveMap({ days = [], currency = '₹' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [selectedDay, setSelectedDay] = useState('ALL');

  // Safely initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Clear Leaflet container ID if left by hot reloads
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    // Initialize Leaflet map
    const initialMap = L.map(mapContainerRef.current, {
      center: [15.4989, 73.8278],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    // High-definition Tiles: Mapbox (if VITE_MAPBOX_TOKEN provided) or Free CartoDB Positron (Zero-Key)
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const tileUrl = mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const tileOptions = mapboxToken
      ? { maxZoom: 19, tileSize: 512, zoomOffset: -1 }
      : { maxZoom: 19, subdomains: 'abcd' };

    L.tileLayer(tileUrl, tileOptions).addTo(initialMap);

    mapInstanceRef.current = initialMap;

    // Trigger invalidateSize after slight delay to ensure full render in active tab
    const timer = setTimeout(() => {
      if (initialMap) {
        initialMap.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers & polylines when days or selectedDay changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !days || days.length === 0) return;

    // Clear previous layers
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

      (day.activities || []).forEach((act, actIdx) => {
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
              background: ${isReplaced ? '#d97706' : dayColor};
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
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
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 240px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: ${dayColor}18; color: ${dayColor}; border: 1px solid ${dayColor}40; padding: 2px 8px; border-radius: 6px;">
                Day ${day.day_number} • Stop ${actIdx + 1}
              </span>
              <span style="font-size: 13px; font-weight: 800; color: #059669;">
                ${currency}${act.estimated_cost?.toLocaleString()}
              </span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a;">
              ${act.name}
            </h4>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
              📍 ${act.location_name || 'Destination Point'} (${act.start_time} - ${act.end_time})
            </div>
            ${isReplaced ? `
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: #d97706;">⚡ Adaptively Replaced for Budget</span>
              </div>
            ` : ''}
            <p style="margin: 0; font-size: 11px; color: #334155; line-height: 1.45; border-top: 1px solid #e2e8f0; padding-top: 6px;">
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
          opacity: 0.85,
          dashArray: '6, 8'
        }).addTo(map);
        polylinesRef.current.push(polyline);
      }
    });

    if (hasPoints) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    map.invalidateSize();
  }, [days, selectedDay, currency]);

  return (
    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Map Header with Day Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
            <Navigation style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Geographic Route & Activity Map</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>OpenStreetMap Engine • Interactive Pins & Day Routes</p>
          </div>
        </div>

        {/* Filter by Day */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: 4, borderRadius: 12, border: '1px solid #e2e8f0', gap: 4 }}>
          <button
            onClick={() => setSelectedDay('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: selectedDay === 'ALL' ? '#4f46e5' : 'transparent',
              color: selectedDay === 'ALL' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s ease'
            }}
          >
            All Stops
          </button>
          {days.map((d) => (
            <button
              key={d.day_number}
              onClick={() => setSelectedDay(d.day_number)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: selectedDay === d.day_number ? '#4f46e5' : 'transparent',
                color: selectedDay === d.day_number ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease'
              }}
            >
              Day {d.day_number}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ 
        width: '100%', 
        height: 520, 
        borderRadius: 14, 
        overflow: 'hidden', 
        border: '1px solid #cbd5e1', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)' 
      }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

    </div>
  );
}
