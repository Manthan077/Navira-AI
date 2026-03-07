#!/bin/bash

# Navira AI - Integration Verification Script

echo "🔍 Verifying Navira AI Traffic Simulation Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2 - File not found: $1"
        ((FAIL++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2 - Directory not found: $1"
        ((FAIL++))
    fi
}

# Function to check port
check_port() {
    if lsof -ti:$1 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Port $1 is in use ($2)"
        ((PASS++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Port $1 is free ($2 not running)"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}1. Checking Project Structure${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_dir "frontend" "Main frontend directory"
check_dir "simulation-main" "Simulation directory"
check_dir "simulation-main/server" "Simulation server directory"
check_dir "docs" "Documentation directory"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}2. Checking Integration Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "frontend/src/components/SimulationModal.tsx" "SimulationModal component"
check_file "frontend/src/features/ambulance-dashboard/components/AmbulanceStatus.tsx" "AmbulanceStatus component"
check_file "simulation-main/vite.config.js" "Simulation vite config"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}3. Checking Scripts${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "start-all.sh" "Startup script"
check_file "stop-all.sh" "Stop script"

if [ -x "start-all.sh" ]; then
    echo -e "${GREEN}✓${NC} start-all.sh is executable"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} start-all.sh is not executable (run: chmod +x start-all.sh)"
fi

if [ -x "stop-all.sh" ]; then
    echo -e "${GREEN}✓${NC} stop-all.sh is executable"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} stop-all.sh is not executable (run: chmod +x stop-all.sh)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}4. Checking Documentation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "SIMULATION_INTEGRATION.md" "Integration guide"
check_file "QUICKSTART.md" "Quick start guide"
check_file "INTEGRATION_SUMMARY.md" "Integration summary"
check_file "README.md" "Main README"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}5. Checking Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_dir "frontend/node_modules" "Main frontend dependencies"
check_dir "simulation-main/node_modules" "Simulation frontend dependencies"
check_dir "simulation-main/server/node_modules" "Simulation server dependencies"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}6. Checking Running Services${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SERVICES_RUNNING=0

if check_port 4000 "Simulation Server"; then
    ((SERVICES_RUNNING++))
fi

if check_port 5173 "Simulation Frontend"; then
    ((SERVICES_RUNNING++))
fi

if check_port 8080 "Main Frontend"; then
    ((SERVICES_RUNNING++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}7. Testing API Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if check_port 4000 "Simulation Server"; then
    if curl -s http://localhost:4000/api/status > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Simulation API responding"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Simulation API not responding"
        ((FAIL++))
    fi
fi

if check_port 5173 "Simulation Frontend"; then
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Simulation frontend responding"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Simulation frontend not responding"
        ((FAIL++))
    fi
fi

if check_port 8080 "Main Frontend"; then
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Main frontend responding"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Main frontend not responding"
        ((FAIL++))
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}Passed:${NC} $PASS"
echo -e "  ${RED}Failed:${NC} $FAIL"
echo ""

if [ $SERVICES_RUNNING -eq 0 ]; then
    echo -e "${YELLOW}⚠ No services are running. Start them with:${NC}"
    echo "  ./start-all.sh"
    echo ""
elif [ $SERVICES_RUNNING -lt 3 ]; then
    echo -e "${YELLOW}⚠ Some services are not running. Restart with:${NC}"
    echo "  ./stop-all.sh && ./start-all.sh"
    echo ""
else
    echo -e "${GREEN}✓ All services are running!${NC}"
    echo ""
    echo "Access points:"
    echo "  Main App:        http://localhost:8080"
    echo "  Simulation UI:   http://localhost:5173"
    echo "  Simulation API:  http://localhost:4000"
    echo ""
fi

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Integration verification complete - All checks passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠ Integration verification complete - Some checks failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
