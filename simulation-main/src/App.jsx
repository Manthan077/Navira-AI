import React, { useState, useEffect, useCallback, useRef } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import Notification from './components/Notification';
import { createSocket } from './utils/socket';

export default function App() {
  const [state, setState] = useState({
    signals: [], vehicles: [], ambulances: [], hospitals: [],
    ambulance: null, patient: null, phase: 'idle',
    emergencyActive: false, greenCorridorSignals: [],
    activeAmbulanceId: null, activeHospitalId: null,
    eta: null, routeProgress: 0, normalTrafficStats: {},
  });
  const [routes, setRoutes] = useState({ toPatient: null, toHospital: null });
  const [metrics, setMetrics] = useState({ normalTime: 0, optimizedTime: 0, timeSaved: 0, finalMetrics: null });
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const notifIdRef = useRef(0);

  const addNotification = useCallback((message, type = 'info') => {
    const id = ++notifIdRef.current;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  useEffect(() => {
    const socket = createSocket((msg) => {
      switch (msg.type) {
        case 'init': setState(msg.data); setIsConnected(true); break;
        case 'tick': setState(msg.data); break;
        case 'phase_change':
          if (msg.data.phase === 'idle') {
            setRoutes({ toPatient: null, toHospital: null });
            setMetrics({ normalTime: 0, optimizedTime: 0, timeSaved: 0, finalMetrics: null });
            setSelectionInfo(null);
          }
          addNotification(msg.data.message, msg.data.phase === 'arrived' ? 'success' : msg.data.phase === 'idle' ? 'info' : 'emergency');
          break;
        case 'metrics_update':
          setMetrics(prev => ({ ...prev, ...msg.data, finalMetrics: msg.data }));
          break;
      }
    });
    return () => socket.close();
  }, [addNotification]);

  const handleCreateEmergency = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRoutes({ toPatient: data.routeToPatient, toHospital: data.routeToHospital });
        setSelectionInfo({ ambulanceOptions: data.ambulanceOptions, hospitalOptions: data.hospitalOptions });
        const totalNormal = (data.routeToPatientDuration || 0) + (data.routeToHospitalDuration || 0);
        const normalMin = Math.round(totalNormal / 60);
        const optimizedMin = Math.round(normalMin * 0.58);
        setMetrics({ normalTime: normalMin * 60, optimizedTime: optimizedMin * 60, timeSaved: (normalMin - optimizedMin) * 60, finalMetrics: null });
        addNotification('🚨 Emergency Created! Fastest units selected.', 'emergency');
      } else {
        addNotification(data.error || 'Failed to create emergency', 'error');
      }
    } catch (err) {
      addNotification('Server connection failed', 'error');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setRoutes({ toPatient: null, toHospital: null });
      setMetrics({ normalTime: 0, optimizedTime: 0, timeSaved: 0, finalMetrics: null });
      setSelectionInfo(null);
    } catch (err) {
      addNotification('Reset failed', 'error');
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-dark-900">
      <div className="w-[370px] min-w-[370px] h-full overflow-y-auto z-10 glass border-r border-white/5">
        <Dashboard state={state} metrics={metrics} routes={routes} isConnected={isConnected}
          onCreateEmergency={handleCreateEmergency} onReset={handleReset}
          loading={loading} selectionInfo={selectionInfo} />
      </div>
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '100vh' }}>
        <MapView state={state} routes={routes} />
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {notifications.map(n => <Notification key={n.id} message={n.message} type={n.type} />)}
        </div>
        <div className="absolute top-4 left-4 z-20">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-corridor-green' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-white/70">{isConnected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>
        {loading && (
          <div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center">
            <div className="glass rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-sm text-white/80 font-medium">Finding fastest routes...</p>
              <p className="text-xs text-white/40">Querying 3 ambulances × 3 hospitals</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
