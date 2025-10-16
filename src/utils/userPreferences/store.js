import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// Storage keys for secure persistence
const USER_PREFERENCES_KEY = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-user-preferences`;

/**
 * User Preferences Store
 * Manages user content preferences and personalization settings
 */
export const useUserPreferencesStore = create((set, get) => ({
  // Initialization state
  isReady: false,
  isLoading: false,
  
  // Club preferences
  favoriteClub: null,
  hasSelectedClub: false,
  
  // Content preferences
  preferredCategories: [],
  preferredCompetitions: [],
  contentLanguage: 'en',
  
  // Notification preferences
  notificationSettings: {
    liveMatchAlerts: true,
    newsUpdates: true,
    clubNewsUpdates: true,
  },
  
  // Usage tracking
  contentInteractions: {
    articlesRead: 0,
    lastActiveDate: null,
    recentCategories: [],
  },
  
  /**
   * Initialize preferences store
   */
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const storedPreferences = await SecureStore.getItemAsync(USER_PREFERENCES_KEY);
      if (storedPreferences) {
        const preferencesData = JSON.parse(storedPreferences);
        set({
          ...preferencesData,
          isReady: true,
          isLoading: false,
        });
      } else {
        set({ 
          isReady: true,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Failed to initialize user preferences:', error);
      set({ 
        isReady: true,
        isLoading: false 
      });
    }
  },
  
  /**
   * Set favorite club
   */
  setFavoriteClub: async (club) => {
    try {
      const updatedState = {
        favoriteClub: club,
        hasSelectedClub: !!club,
      };
      
      const currentState = get();
      const newState = { ...currentState, ...updatedState };
      
      await SecureStore.setItemAsync(USER_PREFERENCES_KEY, JSON.stringify(newState));
      set(updatedState);
      
      return true;
    } catch (error) {
      console.error('Failed to set favorite club:', error);
      return false;
    }
  },
  
  /**
   * Update content interactions
   */
  updateContentInteractions: async (updates) => {
    try {
      const currentState = get();
      const currentInteractions = currentState.contentInteractions;
      
      const updatedInteractions = {
        ...currentInteractions,
        ...updates,
        lastActiveDate: new Date(),
      };
      
      // Update recent categories if category is provided
      if (updates.category) {
        const recentCategories = [...(currentInteractions.recentCategories || [])];
        if (!recentCategories.includes(updates.category)) {
          recentCategories.unshift(updates.category);
          // Keep only last 10 categories
          updatedInteractions.recentCategories = recentCategories.slice(0, 10);
        }
      }
      
      const updatedState = {
        ...currentState,
        contentInteractions: updatedInteractions,
      };
      
      await SecureStore.setItemAsync(USER_PREFERENCES_KEY, JSON.stringify(updatedState));
      set({ contentInteractions: updatedInteractions });
      
      return true;
    } catch (error) {
      console.error('Failed to update content interactions:', error);
      return false;
    }
  },
  
  /**
   * Update notification settings
   */
  updateNotificationSettings: async (settings) => {
    try {
      const currentState = get();
      const updatedSettings = {
        ...currentState.notificationSettings,
        ...settings,
      };
      
      const updatedState = {
        ...currentState,
        notificationSettings: updatedSettings,
      };
      
      await SecureStore.setItemAsync(USER_PREFERENCES_KEY, JSON.stringify(updatedState));
      set({ notificationSettings: updatedSettings });
      
      return true;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return false;
    }
  },
  
  /**
   * Get personalized content filters
   */
  getPersonalizedFilters: () => {
    const { favoriteClub, preferredCategories, preferredCompetitions } = get();
    
    const filters = {};
    
    if (favoriteClub) {
      filters.clubs = [favoriteClub.id];
    }
    
    if (preferredCategories.length > 0) {
      filters.categories = preferredCategories;
    }
    
    if (preferredCompetitions.length > 0) {
      filters.competitions = preferredCompetitions;
    }
    
    return filters;
  },
  
  /**
   * Clear all preferences
   */
  clearPreferences: async () => {
    try {
      await SecureStore.deleteItemAsync(USER_PREFERENCES_KEY);
      
      set({
        favoriteClub: null,
        hasSelectedClub: false,
        preferredCategories: [],
        preferredCompetitions: [],
        contentLanguage: 'en',
        notificationSettings: {
          liveMatchAlerts: true,
          newsUpdates: true,
          clubNewsUpdates: true,
        },
        contentInteractions: {
          articlesRead: 0,
          lastActiveDate: null,
          recentCategories: [],
        },
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear preferences:', error);
      return false;
    }
  },
}));