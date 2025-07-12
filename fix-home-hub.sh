#!/bin/bash

echo "🔧 Fixing Home Hub in WSL..."
echo "================================"

# Kill any existing processes
echo "1. Stopping existing processes..."
pkill -f 'node.*server' 2>/dev/null
pkill -f 'vite' 2>/dev/null
sleep 2

# Navigate to project directory
cd "/home/jcockburn/Home Hub" || {
    echo "❌ Error: Cannot find Home Hub directory"
    exit 1
}

echo "2. Fixing node_modules permissions..."
# Fix permissions for all binaries
chmod +x node_modules/.bin/* 2>/dev/null

echo "3. Starting backend server..."
npm run server &
BACKEND_PID=$!

echo "4. Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo "5. Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "6. Waiting for frontend to start..."
sleep 5

# Get the IP address
IP_ADDRESS=$(ip addr show eth0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 | head -1)

echo "================================"
echo "🎉 Home Hub is now running!"
echo ""
echo "📱 Frontend: http://$IP_ADDRESS:5173/"
echo "🔧 Backend:  http://localhost:3001/api/health"
echo "🔐 OAuth:    http://localhost:3001/auth/google"
echo ""
echo "💡 To access from Windows, use: http://$IP_ADDRESS:5173/"
echo "💡 To stop servers: pkill -f 'node.*server' && pkill -f 'vite'"
echo "================================"

# Keep script running
wait 