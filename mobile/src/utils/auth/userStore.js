import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

/**
 * Enhanced User Store - Manages user profile and booking history for discount eligibility
 */
export const useUserStore = create((set, get) => ({
  // State
  user: null,
  hasBookedBefore: false,
  totalBookings: 0,
  firstBookingDate: null,
  discountEligible: true,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Initialize user profile from storage
  initializeUserProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const storedProfile = await SecureStore.getItemAsync('user-profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        set({
          hasBookedBefore: profile.hasBookedBefore || false,
          totalBookings: profile.totalBookings || 0,
          firstBookingDate: profile.firstBookingDate || null,
          discountEligible: !profile.hasBookedBefore,
          isLoading: false,
        });
      } else {
        // Initialize new user profile
        const newProfile = {
          hasBookedBefore: false,
          totalBookings: 0,
          firstBookingDate: null,
          discountEligible: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await SecureStore.setItemAsync('user-profile', JSON.stringify(newProfile));
        set({
          hasBookedBefore: false,
          totalBookings: 0,
          firstBookingDate: null,
          discountEligible: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Check if user is eligible for first-time booking discount
  checkFirstTimeBookingEligibility: () => {
    const { hasBookedBefore } = get();
    return !hasBookedBefore;
  },

  // Update user booking status after successful booking
  updateUserBookingStatus: async (bookingData) => {
    try {
      const { hasBookedBefore, totalBookings } = get();
      
      const updatedProfile = {
        hasBookedBefore: true,
        totalBookings: totalBookings + 1,
        firstBookingDate: hasBookedBefore ? get().firstBookingDate : new Date().toISOString(),
        discountEligible: false,
        updatedAt: new Date().toISOString(),
      };

      // Save to secure storage
      const storedProfile = await SecureStore.getItemAsync('user-profile');
      const existingProfile = storedProfile ? JSON.parse(storedProfile) : {};
      const mergedProfile = { ...existingProfile, ...updatedProfile };
      
      await SecureStore.setItemAsync('user-profile', JSON.stringify(mergedProfile));
      
      set({
        hasBookedBefore: true,
        totalBookings: totalBookings + 1,
        firstBookingDate: updatedProfile.firstBookingDate,
        discountEligible: false,
      });

      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  // Get user profile summary
  getUserProfile: () => {
    const { hasBookedBefore, totalBookings, firstBookingDate, discountEligible } = get();
    return {
      hasBookedBefore,
      totalBookings,
      firstBookingDate,
      discountEligible,
      isFirstTimeUser: !hasBookedBefore,
    };
  },

  // Reset user profile (for testing/development)
  resetUserProfile: async () => {
    try {
      await SecureStore.deleteItemAsync('user-profile');
      set({
        hasBookedBefore: false,
        totalBookings: 0,
        firstBookingDate: null,
        discountEligible: true,
        error: null,
      });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

/**
 * Hook to get user booking eligibility status
 */
export const useUserBookingStatus = () => {
  const { hasBookedBefore, discountEligible, checkFirstTimeBookingEligibility } = useUserStore();
  
  return {
    isFirstTimeUser: !hasBookedBefore,
    isEligibleForDiscount: discountEligible && checkFirstTimeBookingEligibility(),
    hasBookedBefore,
  };
};