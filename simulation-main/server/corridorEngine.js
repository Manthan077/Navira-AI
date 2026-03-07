// ============================================================
// Rolling Green Corridor Engine
// Only activates 1-2 intersections ahead of the ambulance.
// Signals behind the ambulance are released back to normal.
// ============================================================

class CorridorEngine {
  constructor() {
    // Track signals that have been passed and released so they
    // don't get re-overridden if the ambulance is still nearby.
    this.releasedSignals = new Set();
  }

  /**
   * Called every simulation tick while an emergency is active.
   * Manages the rolling green corridor by:
   *  - Overriding signals within ~8s ETA (1-2 intersections ahead)
   *  - Releasing passed signals back to normal AI control
   *
   * @param {Object} ambulancePos  - { lat, lng }
   * @param {Array}  routeCoords   - interpolated route [{lat,lng}, ...]
   * @param {number} routeIndex    - current position index on route
   * @param {Array}  signals       - all intersection signal objects
   * @param {Object} signalController - SignalController singleton
   * @param {Array}  routeSignalIds - IDs of signals identified on the route
   */
  updateCorridor(ambulancePos, routeCoords, routeIndex, signals, signalController, routeSignalIds) {
    if (!ambulancePos || !routeCoords || routeCoords.length === 0) return;

    const ambulanceSpeedKmH = 60;
    const ACTIVATE_ETA_SECONDS = 8;   // Override signal when ambulance is ≤8s away
    const RELEASE_DISTANCE_KM = 0.2;  // Release signal once ambulance is 200m past it

    const destinationPoint = routeCoords[routeCoords.length - 1];
    const distAmbToDestination = this.haversine(ambulancePos, destinationPoint);

    // Only process signals that are on the route
    const routeSignalSet = new Set(routeSignalIds || []);

    signals.forEach(sig => {
      const sigId = sig.intersection_id || sig.id;

      // Skip signals not on the ambulance route entirely
      if (!routeSignalSet.has(sig.id) && !routeSignalSet.has(sigId)) return;

      // Skip signals we've already released (ambulance has passed them)
      if (this.releasedSignals.has(sigId)) return;

      const distToSignal = this.haversine(ambulancePos, { lat: sig.latitude, lon: sig.longitude });
      const distSigToDestination = this.haversine({ lat: sig.latitude, lon: sig.longitude }, destinationPoint);

      // --- Has the ambulance PASSED this signal? ---
      // The ambulance is past a signal if:
      //  (a) it's closer to the destination than the signal, AND
      //  (b) it's more than RELEASE_DISTANCE_KM away from the signal
      const hasPassed = (distAmbToDestination < distSigToDestination - 0.05) && (distToSignal > RELEASE_DISTANCE_KM);

      if (hasPassed) {
        // Release this signal back to normal traffic control
        signalController.releaseOverride(sigId);
        sig.onRoute = null;
        this.releasedSignals.add(sigId);
        return;
      }

      // --- Should we ACTIVATE this signal? ---
      const etaHours = distToSignal / ambulanceSpeedKmH;
      const etaSeconds = etaHours * 3600;

      if (etaSeconds < ACTIVATE_ETA_SECONDS) {
        // Determine if ambulance approaches N/S or E/W to pick the right green phase
        const currentIndex = Math.floor(routeIndex || 0);
        const nextIndex = Math.min(currentIndex + 5, routeCoords.length - 1);
        const ambBearing = this.calculateBearing(ambulancePos, routeCoords[nextIndex]);

        // NS bearings: roughly 315-45° or 135-225°
        let forcePhase = 1; // NS Green
        if ((ambBearing > 45 && ambBearing < 135) || (ambBearing > 225 && ambBearing < 315)) {
          forcePhase = 3; // EW Green
        }

        signalController.overridePhase(sigId, forcePhase);
        sig.onRoute = 'emergency';

        // Simulate cars clearing out of the corridor
        sig.traffic_density = Math.max(5, sig.traffic_density - 3);
      }
      // If ETA > ACTIVATE_ETA_SECONDS, this signal stays in normal mode — no override
    });
  }

  /**
   * Reset corridor state when emergency ends or is cancelled.
   */
  reset() {
    this.releasedSignals.clear();
  }

  calculateBearing(startNode, endNode) {
    const lat1 = startNode.lat * Math.PI / 180;
    const lon1 = (startNode.lon || startNode.lng) * Math.PI / 180;
    const lat2 = endNode.lat * Math.PI / 180;
    const lon2 = (endNode.lon || endNode.lng) * Math.PI / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  haversine(a, b) {
    const R = 6371;
    const aLat = a.lat || a.latitude;
    const aLng = a.lon || a.lng || a.longitude;
    const bLat = b.lat || b.latitude;
    const bLng = b.lon || b.lng || b.longitude;

    if (!aLat || !bLat) return Infinity;

    const dLat = (bLat - aLat) * Math.PI / 180;
    const dLng = (bLng - aLng) * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
}

module.exports = new CorridorEngine();
