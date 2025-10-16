# Expo SDK 54 Troubleshooting Guide

## Common Issues and Solutions

### 1. npm Permission Errors

**Error**: EACCES permission denied

**Solution**:
```bash
# Try using sudo (not recommended but sometimes necessary)
sudo npm install

# Or fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use npx instead of global npm
npx expo install
```

### 2. Legacy Peer Dependencies

**Issue**: Conflicting peer dependencies

**Solution**:
```bash
# Install with legacy peer deps flag
npm install --legacy-peer-deps

# Or set npm to always use legacy peer deps
npm config set legacy-peer-deps true
```

### 3. Cache Issues

**Issue**: Stale cache causing problems

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Clear Metro cache
npx expo start --clear

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. Worklets Issues

**Issue**: React Native Worklets not working

**Solution**:
1. Ensure babel.config.js has the correct plugin:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // This plugin must be listed last
    ],
  };
};
```

2. Install the correct worklets package:
```bash
npm install react-native-worklets@^1.0.0
```

### 5. TypeScript/React Types Issues

**Issue**: Type errors with React or TypeScript

**Solution**:
1. Ensure correct versions in package.json:
```json
"devDependencies": {
  "@types/react": "~19.1.10",
  "typescript": "~5.9.2"
}
```

2. Update tsconfig.json if needed:
```bash
npx expo customize tsconfig.json
```

### 6. Metro Bundler Issues

**Issue**: Metro bundler not starting or showing errors

**Solution**:
```bash
# Kill any existing Metro processes
pkill -f "metro"
pkill -f "react-native"

# Clear all caches
npx expo start --clear

# Or manually clear caches
rm -rf node_modules/.cache
rm -rf ~/.metro-cache
```

### 7. SDK Version Mismatch

**Issue**: Expo Go app version doesn't match project SDK version

**Solution**:
1. Check your project's SDK version in package.json:
```json
"dependencies": {
  "expo": "54.0.13"
}
```

2. Update Expo Go app on your device to match SDK version

### 8. Babel Configuration Issues

**Issue**: Babel plugins not working correctly

**Solution**:
1. Ensure babel.config.js exists with correct content:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // This plugin must be listed last
    ],
  };
};
```

2. Restart Metro bundler after any Babel changes:
```bash
npx expo start --clear
```

## Verification Steps

After implementing fixes, verify that:

1. All dependencies install without errors
2. Application starts without Metro errors
3. Worklets functionality works correctly
4. TypeScript types are recognized
5. SDK version matches between project and Expo Go app

## Additional Resources

- Expo SDK 54 Release Notes: https://blog.expo.dev/expo-sdk-54-beta-is-now-available-4b7c8b2c2e5a
- Expo Documentation: https://docs.expo.dev/
- React Native Documentation: https://reactnative.dev/