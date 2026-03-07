# Traffic Simulation Integration Guide

## Overview

The traffic simulation module has been integrated into the Ambulance Driver Dashboard. When the driver clicks the "Traffic Simulation" button, a modal opens displaying the full simulation interface.

## Architecture

### Components

1. **SimulationModal** (`frontend/src/components/SimulationModal.tsx`)
   - Modal component that embeds the simulation
   - Checks if simulation server is running
   - Displays helpful error messages if server is not available
   - Embeds simulation via iframe

2. **AmbulanceStatus** (Updated)
   - Added "Traffic Simulation" button
   - Opens the simulation modal when clicked

### How It Works

1. User clicks "Traffic Simulation" button in Ambulance Dashboard
2. Modal opens and checks if simulation server is running (port 4000)
3. If server is running, displays simulation in iframe (port 5173)
4. If server is not running, shows instructions to start it
5. User can interact with full simulation inside the modal

## Setup Instructions

### 1. Install Simulation Dependencies

```bash
# Install simulation frontend dependencies
cd simulation-main
npm install

# Install simulation server dependencies
cd server
npm install
cd ..
```

### 2. Start Simulation Server

```bash
# From simulation-main/server directory
cd simulation-main/server
npm start
```

The server will start on port 4000.

### 3. Start Simulation Frontend

```bash
# From simulation-main directory
cd simulation-main
npm run dev
```

The simulation UI will start on port 5173.

### 4. Start Main Application

```bash
# From frontend directory
cd frontend
npm run dev
```

The main Navira AI application will start on port 8080.

## Usage

1. Login to Navira AI as an ambulance driver
2. Navigate to Ambulance Dashboard
3. Click the "🚦 Traffic Simulation" button
4. The simulation modal will open
5. Click "CREATE EMERGENCY" in the simulation to start
6. Watch the traffic simulation with:
   - Real-time traffic flow
   - Green corridor activation
   - Ambulance routing
   - Hospital selection
   - Performance metrics

## Features

### Simulation Features
- **Real-time Traffic**: Dynamic traffic density on road segments
- **Smart Routing**: OSRM-based route calculation
- **Green Corridor**: Automatic traffic signal priority
- **AI Selection**: Optimal ambulance and hospital selection
- **Performance Metrics**: Time saved, efficiency percentage
- **Live Map**: Interactive Leaflet map with all entities

### Integration Features
- **Server Status Check**: Automatically detects if simulation is running
- **Error Handling**: Clear instructions if server is not available
- **Responsive Modal**: Full-screen simulation view
- **Easy Access**: One-click access from dashboard

## Ports

- **Main App**: http://localhost:8080
- **Simulation Frontend**: http://localhost:5173
- **Simulation Server**: http://localhost:4000

## Troubleshooting

### Simulation Not Loading

1. **Check if simulation server is running**
   ```bash
   curl http://localhost:4000/api/status
   ```

2. **Check if simulation frontend is running**
   ```bash
   curl http://localhost:5173
   ```

3. **Restart servers if needed**
   ```bash
   # Kill existing processes
   lsof -ti:4000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   
   # Restart
   cd simulation-main/server && npm start &
   cd simulation-main && npm run dev &
   ```

### CORS Issues

The simulation vite config has been updated to enable CORS. If you still face issues:

1. Check browser console for errors
2. Ensure simulation server has CORS enabled (already configured)
3. Try accessing simulation directly at http://localhost:5173

### Modal Not Opening

1. Check browser console for errors
2. Ensure SimulationModal component is properly imported
3. Verify Dialog component from shadcn/ui is installed

## Technical Details

### Communication Flow

```
Ambulance Dashboard
    ↓
SimulationModal (checks server)
    ↓
iframe → http://localhost:5173
    ↓
Simulation Frontend (React)
    ↓
WebSocket → ws://localhost:4000
    ↓
Simulation Server (Express + WS)
```

### Data Flow

1. Simulation server maintains state
2. WebSocket broadcasts updates to all clients
3. Simulation frontend renders real-time updates
4. Modal embeds simulation via iframe
5. User interactions trigger API calls to server

## Future Enhancements

1. **Direct Integration**: Embed simulation components directly instead of iframe
2. **Shared State**: Sync simulation with actual ambulance location
3. **Real Data**: Use actual hospital and traffic data from Supabase
4. **Custom Scenarios**: Allow drivers to create custom emergency scenarios
5. **Performance**: Optimize for mobile devices

## Files Modified

1. `frontend/src/components/SimulationModal.tsx` (new)
2. `frontend/src/features/ambulance-dashboard/components/AmbulanceStatus.tsx` (updated)
3. `simulation-main/vite.config.js` (updated)
4. `SIMULATION_INTEGRATION.md` (new)

## Notes

- The simulation runs independently with its own server
- No data is shared between main app and simulation (yet)
- Simulation is for demonstration and testing purposes
- All simulation data is reset when server restarts
