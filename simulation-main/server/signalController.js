class SignalController {
  constructor() {
    this.signals = [];
    this.interval = null;
  }

  init(intersections) {
    this.signals = intersections;
    // Categorize roads per intersection into NS and EW based on bearing
    this.signals.forEach(sig => {
      sig.ns_roads = [];
      sig.ew_roads = [];
      sig.roads.forEach(r => {
        // NS is roughly 315-45 degrees or 135-225 degrees
        if ((r.bearing >= 315 || r.bearing <= 45) || (r.bearing >= 135 && r.bearing <= 225)) {
          sig.ns_roads.push(r.id);
        } else {
          sig.ew_roads.push(r.id);
        }
      });
      
      // Initialize independent state machine for each intersection
      sig.current_phase = 1;
      sig.green_duration = sig.green_duration || 30; // updated dynamically by trafficAI
      // Start them at a random point in their cycle to desynchronize the city
      sig.phase_timer = Math.floor(Math.random() * sig.green_duration) + 1;
      
      this.applyPhase(sig, sig.current_phase);
    });
  }

  start(broadcastCallback) {
    if (this.interval) clearInterval(this.interval);
    
    // 1-second tick loop for accurate, independent phase timers
    this.interval = setInterval(() => {
      let changed = false;

      this.signals.forEach(sig => {
        // If overridden (e.g., green corridor), freeze normal cycle
        if (sig.override_phase) return;

        sig.phase_timer--;

        if (sig.phase_timer <= 0) {
          // Transition to next phase
          sig.current_phase++;
          if (sig.current_phase > 4) sig.current_phase = 1;

          this.applyPhase(sig, sig.current_phase);
          
          // Set timer for the new phase
          if (sig.current_phase === 1 || sig.current_phase === 3) {
            // Green phase (dynamic duration from Traffic AI)
            sig.phase_timer = sig.green_duration || 30;
          } else {
            // Yellow phase (fixed 3 seconds)
            sig.phase_timer = 3;
          }
          changed = true;
        }
      });

      // Broadcast mostly just to make sure frontend state is synced, 
      // though the main simulation loop also broadcasts
      if (changed) {
        broadcastCallback('signal_update', this.signals);
      }
    }, 1000);
  }

  applyPhase(sig, phase) {
    sig.current_phase = phase;
    switch (phase) {
      case 1: // NS Green, EW Red
        sig.ns_state = 'GREEN';
        sig.ew_state = 'RED';
        sig.signal_state = 'NS-GREEN';
        break;
      case 2: // NS Yellow, EW Red
        sig.ns_state = 'YELLOW';
        sig.ew_state = 'RED';
        sig.signal_state = 'NS-YELLOW';
        break;
      case 3: // NS Red, EW Green
        sig.ns_state = 'RED';
        sig.ew_state = 'GREEN';
        sig.signal_state = 'EW-GREEN';
        break;
      case 4: // NS Red, EW Yellow
        sig.ns_state = 'RED';
        sig.ew_state = 'YELLOW';
        sig.signal_state = 'EW-YELLOW';
        break;
    }
  }

  // Used by AI traffic pulse to dynamically adjust green duration
  updateGreenTime(intersectionId, duration) {
    const sig = this.signals.find(s => s.intersection_id === intersectionId);
    if (sig) sig.green_duration = duration;
  }

  // Used by Green Corridor to lock an intersection to a specific phase
  overridePhase(intersectionId, forcePhase) {
    const sig = this.signals.find(s => s.intersection_id === intersectionId);
    if (sig) {
      sig.override_phase = true;
      this.applyPhase(sig, forcePhase);
    }
  }

  releaseOverride(intersectionId) {
    const sig = this.signals.find(s => s.intersection_id === intersectionId);
    if (sig) {
      sig.override_phase = false;
      // Letting it resume its saved timer, or we could reset it. Resuming is fine.
    }
  }
}

module.exports = new SignalController();
