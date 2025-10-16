#!/bin/bash

# Expo SDK 54 Startup Script

echo "Expo SDK 54 Startup Script"
echo "=========================="

# Clear Metro cache
echo "Clearing Metro cache..."
npx expo start --clear

# Start the application
echo "Starting the application..."
npx expo start