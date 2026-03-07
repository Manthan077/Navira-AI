import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SIGNAL_COLORS = { 
  RED: '#ef4444', YELLOW: '#eab308', GREEN: '#22c55e',
  'NS-GREEN': '#22c55e', 'EW-GREEN': '#ef4444',
  'NS-YELLOW': '#eab308', 'EW-YELLOW': '#ef4444'
};

function getDensityColor(vehicles) {
  if (vehicles > 30) return '#ef4444'; // Red (Heavy 31+)
  if (vehicles > 15) return '#f97316'; // Orange (Medium 16-30)
  return '#22c55e'; // Green (Low 5-15)
}

export default function MapView({ state, routes }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({
    roads: {},
    signals: {},
    ambulances: {},
    hospitals: {},
    activeAmbulance: null,
    patient: null,
    routeToPatient: null,
    routeToHospital: null,
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapContainer.current, {
      center: [30.7333, 76.7794], // Chandigarh center
      zoom: 13,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'traffic-legend');
      div.innerHTML = `
        <div style="background:rgba(17,24,39,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;font-family:Inter,sans-serif;font-size:11px;color:rgba(255,255,255,0.7);">
          <div style="font-weight:700;margin-bottom:6px;color:white;font-size:11px;">Traffic Conditions</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><div style="width:16px;height:3px;background:#ef4444;"></div> Heavy Traffic (31+)</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:16px;height:3px;background:#f97316;"></div> Moderate Traffic (16-30)</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><div style="width:16px;height:3px;background:#22c55e;"></div> Light Traffic (5-15)</div>
          <div style="height:1px;background:rgba(255,255,255,0.1);margin:8px 0;"></div>
          <div style="font-weight:700;margin-bottom:6px;color:white;font-size:11px;">Signals</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#ef4444;"></div> Red / Stop</div>
          <div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:50%;background:#22c55e;"></div> Green / Go</div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    (state.roadSegments || []).forEach(seg => {
      const id = seg.id;
      const color = getDensityColor(seg.vehicles || 30);
      const isTraffic = (seg.vehicles > 30);
      const weight = isTraffic ? 4 : 3;
      
      if (layersRef.current.roads[id]) {
        if (seg.coords) {
          layersRef.current.roads[id].setLatLngs(seg.coords.map(c => [c.lat, c.lng]));
        }
        layersRef.current.roads[id].setStyle({ color, weight, opacity: isTraffic ? 0.9 : 0.6 });
      } else {
        const points = seg.coords ? seg.coords.map(c => [c.lat, c.lng]) : [];
        if (points.length > 0) {
          const polyline = L.polyline(points, {
            color,
            weight,
            opacity: isTraffic ? 0.9 : 0.6,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false
          }).addTo(map);
          layersRef.current.roads[id] = polyline;
        }
      }
    });

    Object.keys(layersRef.current.roads).forEach(id => {
      if (!state.roadSegments.find(s => s.id === id)) {
        map.removeLayer(layersRef.current.roads[id]);
        delete layersRef.current.roads[id];
      }
    });
  }, [state.roadSegments]);

  // Single traffic signal circle per intersection
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const activeSignalIds = new Set();

    (state.signals || []).forEach(sig => {
      const markerId = sig.intersection_id || sig.id;
      activeSignalIds.add(markerId);

      const isEmergency = sig.override_phase || sig.onRoute === 'emergency';

      // Determine signal color: emergency override = green, else use current signal state
      let color = SIGNAL_COLORS[sig.signal_state] || '#ef4444';
      let glowColor = 'rgba(107,114,128,0.3)';
      if (isEmergency) {
        color = '#22c55e';
        glowColor = 'rgba(34,197,94,0.5)';
      }

      const size = 10;
      const iconHtml = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:1.5px solid rgba(255,255,255,0.25);box-shadow:0 0 6px ${glowColor};transition:background 0.3s ease;"></div>`;

      if (layersRef.current.signals[markerId]) {
        layersRef.current.signals[markerId].setIcon(
          L.divIcon({ className: '', html: iconHtml, iconSize: [size, size], iconAnchor: [size/2, size/2] })
        );
      } else {
        const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [size, size], iconAnchor: [size/2, size/2] });
        const marker = L.marker([sig.latitude, sig.longitude], { icon, zIndexOffset: 200 }).addTo(map);
        marker.bindTooltip(
          `<b>Intersection ${markerId}</b><br/>Phase ${sig.current_phase || 1}: ${sig.signal_state || 'RED'}<br/>Timer: ${sig.phase_timer || 0}s<br/>Density: ${sig.traffic_density} vehicles${isEmergency ? '<br/><span style="color:#4ade80">🚨 GREEN CORRIDOR</span>' : ''}`,
          { className: 'custom-tooltip', direction: 'top', offset: [0, -6] }
        );
        layersRef.current.signals[markerId] = marker;
      }
    });

    // Remove stale signal markers
    Object.keys(layersRef.current.signals).forEach(id => {
      if (!activeSignalIds.has(id)) {
        map.removeLayer(layersRef.current.signals[id]);
        delete layersRef.current.signals[id];
      }
    });
  }, [state.signals]);

  // Show ambulances
  useEffect(() => {
    if (!mapRef.current || !state.ambulances) return;
    const map = mapRef.current;

    state.ambulances.forEach(amb => {
      const isActive = state.activeAmbulanceId === amb.id;
      const markerId = `amb-${amb.id}`;

      if (isActive && layersRef.current.ambulances[markerId]) {
        map.removeLayer(layersRef.current.ambulances[markerId]);
        delete layersRef.current.ambulances[markerId];
        return;
      }
      if (isActive) return;

      if (!layersRef.current.ambulances[markerId]) {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 8px rgba(99,102,241,0.5);border:2px solid rgba(255,255,255,0.2);opacity:${amb.available ? 1 : 0.4};">🚑</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13],
        });
        const marker = L.marker([amb.lat, amb.lng], { icon }).addTo(map);
        marker.bindTooltip(amb.label, { className: 'custom-tooltip', direction: 'top', offset: [0, -13] });
        layersRef.current.ambulances[markerId] = marker;
      }
    });

    // Clean up missing ambulances (if list reduced)
    Object.keys(layersRef.current.ambulances).forEach(id => {
      const ambId = id.replace('amb-', '');
      if (!state.ambulances.find(a => a.id === ambId)) {
        map.removeLayer(layersRef.current.ambulances[id]);
        delete layersRef.current.ambulances[id];
      }
    });
  }, [state.ambulances, state.activeAmbulanceId]);

  // Show hospitals
  useEffect(() => {
    if (!mapRef.current || !state.hospitals) return;
    const map = mapRef.current;

    state.hospitals.forEach(hosp => {
      const markerId = `hosp-${hosp.id}`;
      const isActive = state.activeHospitalId === hosp.id;

      if (layersRef.current.hospitals[markerId]) {
        map.removeLayer(layersRef.current.hospitals[markerId]);
        delete layersRef.current.hospitals[markerId];
      }

      const pulsing = isActive ? `
        <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(34,197,94,0.2);animation:hospPulse 2s ease-in-out infinite;"></div>
        <style>@keyframes hospPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.5);opacity:0}}</style>
      ` : '';

      const size = isActive ? 38 : 28;
      const innerSize = isActive ? 34 : 24;
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
          ${pulsing}
          <div style="width:${innerSize}px;height:${innerSize}px;border-radius:50%;background:linear-gradient(135deg,${isActive ? '#22c55e' : '#059669'},${isActive ? '#16a34a' : '#047857'});display:flex;align-items:center;justify-content:center;font-size:${isActive ? 17 : 12}px;box-shadow:0 0 ${isActive ? 14 : 6}px rgba(34,197,94,${isActive ? 0.7 : 0.3});border:2px solid rgba(255,255,255,${isActive ? 0.4 : 0.15});">🏥</div>
        </div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([hosp.lat, hosp.lng], { icon }).addTo(map);
      marker.bindTooltip(`${hosp.label}${isActive ? ' ⭐ Selected' : ''}`, { className: 'custom-tooltip', direction: 'top', offset: [0, -15] });
      layersRef.current.hospitals[markerId] = marker;
    });

    Object.keys(layersRef.current.hospitals).forEach(id => {
      const hospId = id.replace('hosp-', '');
      if (!state.hospitals.find(h => h.id === hospId)) {
        map.removeLayer(layersRef.current.hospitals[id]);
        delete layersRef.current.hospitals[id];
      }
    });
  }, [state.hospitals, state.activeHospitalId]);

  // Update OSRM routing lines
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (routes.toPatient && routes.toPatient.length > 0) {
      if (layersRef.current.routeToPatient) map.removeLayer(layersRef.current.routeToPatient);
      const latlngs = routes.toPatient.map(p => [p.lat, p.lng]);
      const outline = L.polyline(latlngs, { color: 'rgba(34,197,94,0.3)', weight: 12, opacity: 1 });
      const line = L.polyline(latlngs, { color: '#39ff14', weight: 8, opacity: 1 });
      layersRef.current.routeToPatient = L.layerGroup([outline, line]).addTo(map);
    }

    if (routes.toHospital && routes.toHospital.length > 0 && (state.phase === 'to_hospital' || state.phase === 'arrived')) {
      if (layersRef.current.routeToHospital) map.removeLayer(layersRef.current.routeToHospital);
      const latlngs = routes.toHospital.map(p => [p.lat, p.lng]);
      const outline = L.polyline(latlngs, { color: 'rgba(34,197,94,0.3)', weight: 12, opacity: 1 });
      const line = L.polyline(latlngs, { color: '#39ff14', weight: 8, opacity: 1 });
      layersRef.current.routeToHospital = L.layerGroup([outline, line]).addTo(map);
    }
  }, [routes, state.phase]);

  // Cleanup on reset
  useEffect(() => {
    if (state.phase === 'idle' && mapRef.current) {
      const map = mapRef.current;
      ['routeToPatient', 'routeToHospital', 'patient', 'activeAmbulance'].forEach(key => {
        if (layersRef.current[key]) { map.removeLayer(layersRef.current[key]); layersRef.current[key] = null; }
      });
    }
  }, [state.phase]);

  // Active ambulance (animated)
  useEffect(() => {
    if (!mapRef.current || !state.ambulance) return;
    const map = mapRef.current;

    const icon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(239,68,68,0.25);animation:ambPulse 1.5s ease-in-out infinite;"></div>
        <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 16px rgba(239,68,68,0.8);border:2px solid rgba(255,255,255,0.6);">🚑</div>
      </div>
      <style>@keyframes ambPulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.6);opacity:0}}</style>`,
      iconSize: [40, 40], iconAnchor: [20, 20],
    });

    if (layersRef.current.activeAmbulance) {
      layersRef.current.activeAmbulance.setLatLng([state.ambulance.lat, state.ambulance.lng]);
    } else {
      layersRef.current.activeAmbulance = L.marker([state.ambulance.lat, state.ambulance.lng], { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [state.ambulance]);

  // Patient marker (fully random position now)
  useEffect(() => {
    if (!mapRef.current || !state.patient || !state.emergencyActive) return;
    const map = mapRef.current;

    if (!layersRef.current.patient) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(249,115,22,0.2);animation:patPulse 2s ease-in-out infinite;"></div>
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 14px rgba(249,115,22,0.7);border:2px solid rgba(255,255,255,0.4);">🧑</div>
        </div>
        <style>@keyframes patPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.4);opacity:0}}</style>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      });
      layersRef.current.patient = L.marker([state.patient.lat, state.patient.lng], { icon, zIndexOffset: 900 }).addTo(map);
      layersRef.current.patient.bindTooltip(`Patient Location: Emergency!`, { className: 'custom-tooltip', direction: 'top', offset: [0, -17] });
    }
  }, [state.patient, state.emergencyActive]);

  return (
    <div ref={mapContainer} id="map-container"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 1 }} />
  );
}
