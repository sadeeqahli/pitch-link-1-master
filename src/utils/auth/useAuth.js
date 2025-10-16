import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';

// Mock user database for development
const MOCK_USERS_KEY = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-mock-users`;

// Helper function to get mock users from storage
const getMockUsers = async () => {
  try {
    const users = await SecureStore.getItemAsync(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    return [];
  }
};

// Helper function to save users to storage
const saveMockUsers = async (users) => {
  try {
    await SecureStore.setItemAsync(MOCK_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

// Helper function to generate user ID
const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(async () => {
    try {
      const storedAuth = await SecureStore.getItemAsync(authKey);
      useAuthStore.setState({
        auth: storedAuth ? JSON.parse(storedAuth) : null,
        isReady: true,
      });
    } catch (error) {
      console.log('Error loading auth:', error);
      useAuthStore.setState({
        auth: null,
        isReady: true,
      });
    }
  }, []);

  useEffect(() => {
    initiate();
  }, [initiate]);

  const signIn = useCallback(async (credentials) => {
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get existing users
      const users = await getMockUsers();
      
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!user) {
        throw new Error('Account not found. Please sign up first.');
      }
      
      // Check password (in real app, this would be hashed)
      if (user.password !== credentials.password) {
        throw new Error('Invalid password. Please try again.');
      }
      
      const authData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        jwt: 'mock-jwt-token-' + Date.now()
      };
      
      // Save to secure store
      await SecureStore.setItemAsync(authKey, JSON.stringify(authData));
      setAuth(authData);
      
      return authData;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);
  
  const signOut = useCallback(async () => {
    try {
      // Remove auth data from secure store
      await SecureStore.deleteItemAsync(authKey);
      
      // Update auth state
      setAuth(null);
      
      // Navigate to sign in screen
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [setAuth]);

  const signUp = useCallback(async (userData) => {
    try {
      if (!userData?.email || !userData?.password || !userData?.name) {
        throw new Error('Name, email, and password are required');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get existing users
      const users = await getMockUsers();
      
      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: generateUserId(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password, // In a real app, this would be hashed
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      await saveMockUsers(users);
      
      const authData = {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
        },
        jwt: 'mock-jwt-token-' + Date.now()
      };
      
      // Save to secure store
      await SecureStore.setItemAsync(authKey, JSON.stringify(authData));
      setAuth(authData);
      
      return authData;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);

  const getCurrentUser = useCallback(() => {
    return auth?.user || null;
  }, [auth]);

  const updateUserProfile = useCallback(async (updates) => {
    try {
      if (!auth?.user?.id) {
        throw new Error('No authenticated user');
      }

      const users = await getMockUsers();
      const userIndex = users.findIndex(u => u.id === auth.user.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await saveMockUsers(users);

      // Update auth state
      const updatedAuth = {
        ...auth,
        user: {
          ...auth.user,
          ...updates,
        },
      };

      await SecureStore.setItemAsync(authKey, JSON.stringify(updatedAuth));
      setAuth(updatedAuth);

      return updatedAuth.user;
    } catch (error) {
      throw error;
    }
  }, [auth, setAuth]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    user: auth?.user || null,
    getCurrentUser,
    updateUserProfile,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;