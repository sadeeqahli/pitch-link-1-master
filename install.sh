#!/bin/bash

# Expo SDK 54 Installation Script

echo "Expo SDK 54 Installation Script"
echo "================================"

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove existing node_modules and package-lock.json
echo "Removing existing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install core packages first
echo "Installing core packages..."
npm install expo@54.0.13 react@19.0.0 react-native@0.79.5 --legacy-peer-deps

# Install development dependencies
echo "Installing development dependencies..."
npm install @types/react@~19.1.10 typescript@~5.9.2 babel-preset-expo@~13.0.0 --legacy-peer-deps

# Install worklets
echo "Installing worklets..."
npm install react-native-worklets@^1.0.0 --legacy-peer-deps

# Install other dependencies
echo "Installing other Expo dependencies..."
npm install expo-router@^5.1.6 react-native-reanimated@~3.18.0 --legacy-peer-deps

echo "Installation script completed. Run 'npx expo start --clear' to start the application."