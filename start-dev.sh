#!/bin/bash

echo "Starting Home Service App Development Environment..."
echo

echo "Starting Backend Server..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend Development Server..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: Check the Expo output for the development URL"
echo
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user to stop
wait
