#!/bin/bash

# 3D Word Cloud Setup Script for macOS
# This script installs all dependencies and starts both frontend and backend servers

set -e  # Exit on any error

echo "========================================"
echo "  3D Word Cloud Setup Script"
echo "========================================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Error: Yarn is not installed. Installing Yarn..."
    npm install -g yarn
fi

echo "✓ Yarn found: $(yarn --version)"
echo ""

# Install Backend Dependencies
echo "========================================"
echo "  Installing Backend Dependencies"
echo "========================================"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Download NLTK data
echo "Downloading NLTK stopwords data..."
python3 -c "import nltk; nltk.download('stopwords', quiet=True)"

echo "✓ Backend dependencies installed"
echo ""

cd ..

# Install Frontend Dependencies
echo "========================================"
echo "  Installing Frontend Dependencies"
echo "========================================"
cd frontend

echo "Installing Node packages..."
yarn install --ignore-engines

echo "✓ Frontend dependencies installed"
echo ""

cd ..

# Start both servers
echo "========================================"
echo "  Starting Servers"
echo "========================================"
echo ""
echo "🚀 Backend server will start on http://localhost:8001"
echo "🚀 Frontend server will start on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo "\n\n========================================"
    echo "  Shutting down servers..."
    echo "========================================"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend server
echo "Starting backend server..."
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd frontend
yarn start > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ Both servers started successfully!"
echo ""
echo "📊 Backend logs: backend/backend.log"
echo "📊 Frontend logs: frontend/frontend.log"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
