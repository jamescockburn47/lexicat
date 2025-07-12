#!/bin/bash

echo "🚀 Home Hub Startup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the Home Hub directory."
    exit 1
fi

print_success "Found Home Hub project directory"

# Step 1: Kill all existing processes
print_status "Stopping existing processes..."
pkill -f 'node.*server' 2>/dev/null
pkill -f 'vite' 2>/dev/null
pkill -f 'npm run server' 2>/dev/null
pkill -f 'npm run dev' 2>/dev/null

# Wait for processes to stop
sleep 3

# Check if ports are free
if lsof -i :3001 >/dev/null 2>&1; then
    print_warning "Port 3001 still in use. Force killing..."
    sudo lsof -ti :3001 | xargs kill -9 2>/dev/null
fi

if lsof -i :5173 >/dev/null 2>&1; then
    print_warning "Port 5173 still in use. Force killing..."
    sudo lsof -ti :5173 | xargs kill -9 2>/dev/null
fi

sleep 2

# Step 2: Check and fix permissions
print_status "Fixing node_modules permissions..."
chmod +x node_modules/.bin/* 2>/dev/null || print_warning "Could not fix all permissions"

# Step 3: Check environment variables
print_status "Checking environment variables..."

if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    if [ -f "env.example" ]; then
        print_status "Creating .env from env.example..."
        cp env.example .env
        print_warning "Please edit .env with your actual credentials"
    else
        print_error "No env.example found either!"
        exit 1
    fi
fi

# Check if required env vars are set
source .env 2>/dev/null

if [ -z "$GOOGLE_OAUTH2_CLIENT_ID" ] || [ "$GOOGLE_OAUTH2_CLIENT_ID" = "your_google_oauth2_client_id_here" ]; then
    print_warning "GOOGLE_OAUTH2_CLIENT_ID not set or using placeholder"
fi

if [ -z "$GOOGLE_OAUTH2_CLIENT_SECRET" ] || [ "$GOOGLE_OAUTH2_CLIENT_SECRET" = "your_google_oauth2_client_secret_here" ]; then
    print_warning "GOOGLE_OAUTH2_CLIENT_SECRET not set or using placeholder"
fi

if [ -z "$GOOGLE_CALENDAR_ID" ] || [ "$GOOGLE_CALENDAR_ID" = "your_calendar_id_here" ]; then
    print_warning "GOOGLE_CALENDAR_ID not set or using placeholder"
fi

# Step 4: Start backend server
print_status "Starting backend server..."
npm run server &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend server is running on http://localhost:3001"
else
    print_error "Backend server failed to start"
    print_status "Checking backend logs..."
    wait $BACKEND_PID 2>/dev/null
    exit 1
fi

# Step 5: Start frontend server
print_status "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Get the IP address
IP_ADDRESS=$(ip addr show eth0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 | head -1)

# Check if frontend is running
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    print_success "Frontend server is running on http://localhost:5173"
elif curl -s http://localhost:5174/ > /dev/null 2>&1; then
    print_success "Frontend server is running on http://localhost:5174"
else
    print_warning "Frontend server may not be fully started yet"
fi

# Step 6: Display access information
echo ""
echo "🎉 Home Hub is now running!"
echo "=========================="
echo ""
echo "📱 Frontend URLs:"
echo "   Local:  http://localhost:5173/"
echo "   Network: http://$IP_ADDRESS:5173/"
echo ""
echo "🔧 Backend URLs:"
echo "   Health: http://localhost:3001/api/health"
echo "   OAuth:  http://localhost:3001/auth/google"
echo "   Calendar: http://localhost:3001/api/calendar/list"
echo ""
echo "💡 To access from Windows browser:"
echo "   http://$IP_ADDRESS:5173/"
echo ""
echo "🛑 To stop servers:"
echo "   pkill -f 'node.*server' && pkill -f 'vite'"
echo ""
echo "📊 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo "=========================="

# Function to handle cleanup on script exit
cleanup() {
    print_status "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and show status
print_status "Servers are running. Press Ctrl+C to stop."
echo ""

# Monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend server stopped unexpectedly"
        break
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend server stopped unexpectedly"
        break
    fi
    
    sleep 10
done

cleanup 