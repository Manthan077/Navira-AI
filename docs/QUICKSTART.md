# 🚀 Quick Start Guide - Navira AI with Traffic Simulation

## Prerequisites
- Node.js 18+ and npm
- Supabase account (for main app)

## Option 1: Quick Start (Recommended)

### Start All Services at Once

```bash
# Make scripts executable (first time only)
chmod +x start-all.sh stop-all.sh

# Start everything
./start-all.sh
```

This will automatically start:
- ✅ Main Frontend (http://localhost:8080)
- ✅ Simulation Frontend (http://localhost:5173)
- ✅ Simulation Server (http://localhost:4000)

### Stop All Services

```bash
./stop-all.sh
```

## Option 2: Manual Start

### Step 1: Install Dependencies

```bash
# Main frontend
cd frontend
npm install
cd ..

# Simulation frontend
cd simulation-main
npm install
cd ..

# Simulation server
cd simulation-main/server
npm install
cd ../..
```

### Step 2: Configure Environment

Create `frontend/.env`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### Step 3: Start Services

**Terminal 1 - Simulation Server:**
```bash
cd simulation-main/server
npm start
```

**Terminal 2 - Simulation Frontend:**
```bash
cd simulation-main
npm run dev
```

**Terminal 3 - Main Frontend:**
```bash
cd frontend
npm run dev
```

## Usage

1. Open http://localhost:8080 in your browser
2. Login with demo credentials:
   - **Driver:** manthan@gmail.com / Manthan123
   - **Hospital:** puneet@gmail.com / Puneet123
   - **Admin:** hardik@gmail.com / Hardik123

3. Navigate to Ambulance Dashboard
4. Click "🚦 Traffic Simulation" button
5. In the simulation modal, click "CREATE EMERGENCY"
6. Watch the traffic simulation in action!

## Features to Try

### In Main Dashboard:
- Create emergency tokens
- Track ambulance location
- View real-time routes
- Chat with MediBot AI

### In Traffic Simulation:
- Create emergency scenarios
- Watch green corridor activation
- See AI ambulance/hospital selection
- Monitor performance metrics
- View traffic density changes

## Troubleshooting

### Simulation Not Loading?

1. **Check if servers are running:**
   ```bash
   # Check simulation server
   curl http://localhost:4000/api/status
   
   # Check simulation frontend
   curl http://localhost:5173
   ```

2. **Restart services:**
   ```bash
   ./stop-all.sh
   ./start-all.sh
   ```

3. **Check logs:**
   ```bash
   tail -f logs/simulation-server.log
   tail -f logs/simulation-frontend.log
   tail -f logs/main-frontend.log
   ```

### Port Already in Use?

```bash
# Kill processes on specific ports
lsof -ti:4000 | xargs kill -9  # Simulation server
lsof -ti:5173 | xargs kill -9  # Simulation frontend
lsof -ti:8080 | xargs kill -9  # Main frontend
```

### Dependencies Issues?

```bash
# Clean install
rm -rf frontend/node_modules
rm -rf simulation-main/node_modules
rm -rf simulation-main/server/node_modules

# Reinstall
cd frontend && npm install && cd ..
cd simulation-main && npm install && cd ..
cd simulation-main/server && npm install && cd ../..
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Main App | http://localhost:8080 | Navira AI Dashboard |
| Simulation UI | http://localhost:5173 | Traffic Simulation |
| Simulation API | http://localhost:4000 | Simulation Backend |

## Next Steps

- Read [Simulation Integration Guide](SIMULATION_INTEGRATION.md) for technical details
- Check [System Architecture](docs/system-architecture.md) for system overview
- See [Admin Command Center](docs/ADMIN_COMMAND_CENTER.md) for admin features

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in `logs/` directory
3. Ensure all dependencies are installed
4. Verify ports are not in use by other applications
