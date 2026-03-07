#!/bin/bash

# Navira AI - Complete Startup Script
# This script starts all required services

echo "🚑 Starting Navira AI with Traffic Simulation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}Killing existing process on port $1${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Clean up ports
echo "🧹 Cleaning up ports..."
kill_port 4000  # Simulation server
kill_port 5173  # Simulation frontend
kill_port 8080  # Main frontend

echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exist
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

if [ ! -d "simulation-main/node_modules" ]; then
    echo -e "${YELLOW}Installing simulation frontend dependencies...${NC}"
    cd simulation-main && npm install && cd ..
fi

if [ ! -d "simulation-main/server/node_modules" ]; then
    echo -e "${YELLOW}Installing simulation server dependencies...${NC}"
    cd simulation-main/server && npm install && cd ../..
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start simulation server
echo -e "${BLUE}[1/3] Starting Simulation Server (port 4000)...${NC}"
cd simulation-main/server
npm start > ../../logs/simulation-server.log 2>&1 &
SIMULATION_SERVER_PID=$!
cd ../..
sleep 2

# Start simulation frontend
echo -e "${BLUE}[2/3] Starting Simulation Frontend (port 5173)...${NC}"
cd simulation-main
npm run dev > ../logs/simulation-frontend.log 2>&1 &
SIMULATION_FRONTEND_PID=$!
cd ..
sleep 2

# Start main frontend
echo -e "${BLUE}[3/3] Starting Main Frontend (port 8080)...${NC}"
cd frontend
npm run dev > ../logs/main-frontend.log 2>&1 &
MAIN_FRONTEND_PID=$!
cd ..
sleep 3

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🌐 Access Points:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${BLUE}Main Application:${NC}      http://localhost:8080"
echo -e "  ${BLUE}Simulation Frontend:${NC}   http://localhost:5173"
echo -e "  ${BLUE}Simulation Server:${NC}     http://localhost:4000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📝 Process IDs:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Simulation Server:   $SIMULATION_SERVER_PID"
echo "  Simulation Frontend: $SIMULATION_FRONTEND_PID"
echo "  Main Frontend:       $MAIN_FRONTEND_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 Usage:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Open http://localhost:8080 in your browser"
echo "  2. Login as ambulance driver"
echo "  3. Click '🚦 Traffic Simulation' button"
echo "  4. Enjoy the simulation!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Press Ctrl+C or run: ./stop-all.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Save PIDs to file for stop script
echo "$SIMULATION_SERVER_PID" > logs/pids.txt
echo "$SIMULATION_FRONTEND_PID" >> logs/pids.txt
echo "$MAIN_FRONTEND_PID" >> logs/pids.txt

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping all services...'; kill $SIMULATION_SERVER_PID $SIMULATION_FRONTEND_PID $MAIN_FRONTEND_PID 2>/dev/null; echo '✅ All services stopped'; exit 0" INT

# Keep script running
wait
