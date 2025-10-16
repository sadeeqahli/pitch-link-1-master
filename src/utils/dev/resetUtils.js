import * as SecureStore from 'expo-secure-store';

/**
 * Utility functions for managing onboarding and auth state during development
 */

export const resetOnboarding = async () => {
  try {
    await SecureStore.deleteItemAsync('hasCompletedOnboarding');
    console.log('Onboarding status reset');
  } catch (error) {
    console.log('Error resetting onboarding:', error);
  }
};

export const resetAuth = async () => {
  try {
    await SecureStore.deleteItemAsync('auth');
    console.log('Auth status reset');
  } catch (error) {
    console.log('Error resetting auth:', error);
  }
};

export const resetAll = async () => {
  await resetOnboarding();
  await resetAuth();
  console.log('All data reset');
};

// For development - you can call these functions in the console
// globalThis.resetOnboarding = resetOnboarding;
// globalThis.resetAuth = resetAuth;
// globalThis.resetAll = resetAll;