#!/bin/bash

# Navira AI - Stop All Services Script

echo "🛑 Stopping Navira AI services..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Function to kill process on port
kill_port() {
    if lsof -ti:$1 > /dev/null 2>&1; then
        echo -e "  ${RED}Stopping service on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 1
        echo -e "  ${GREEN}✓ Port $1 freed${NC}"
    fi
}

# Kill by PIDs if available
if [ -f "logs/pids.txt" ]; then
    echo "Stopping services by PID..."
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
        fi
    done < logs/pids.txt
    rm logs/pids.txt
fi

# Kill by ports as backup
echo ""
echo "Ensuring all ports are freed..."
kill_port 4000  # Simulation server
kill_port 5173  # Simulation frontend  
kill_port 8080  # Main frontend

echo ""
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
