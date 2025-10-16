#!/bin/bash

# PitchLink Expo SDK 54 Startup Script

echo "🚀 Starting PitchLink Expo SDK 54 Application"
echo "=========================================="

# Navigate to project directory
cd /Users/macbookair/Desktop/pitch-link-1-master/pitch-link-1-master/mobile

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory found"
else
    echo "❌ node_modules directory not found"
    echo "Please run 'npm install --legacy-peer-deps' first"
    exit 1
fi

# Start Expo with clean cache
echo "🔄 Clearing cache and starting Expo..."
npx expo start --clear

echo "✅ Expo server started successfully!"
echo "📱 Scan the QR code with Expo Go to test on your device"
echo "🌐 Visit http://localhost:8081 for web version"
echo "Press Ctrl+C to stop the server"