#!/bin/bash

echo "🛑 Stopping Home Hub..."
echo "========================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Kill all Home Hub related processes
print_status "Stopping all Home Hub processes..."

pkill -f 'node.*server' 2>/dev/null
pkill -f 'vite' 2>/dev/null
pkill -f 'npm run server' 2>/dev/null
pkill -f 'npm run dev' 2>/dev/null

# Force kill if still running
sleep 2

if lsof -i :3001 >/dev/null 2>&1; then
    print_status "Force killing port 3001..."
    sudo lsof -ti :3001 | xargs kill -9 2>/dev/null
fi

if lsof -i :5173 >/dev/null 2>&1; then
    print_status "Force killing port 5173..."
    sudo lsof -ti :5173 | xargs kill -9 2>/dev/null
fi

if lsof -i :5174 >/dev/null 2>&1; then
    print_status "Force killing port 5174..."
    sudo lsof -ti :5174 | xargs kill -9 2>/dev/null
fi

print_success "All Home Hub processes stopped!"
echo ""
echo "💡 To start again, run: ./start-home-hub.sh" 