import { create } from 'zustand';
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { 
  DEFAULT_PRICING, 
  SUBSCRIPTION_STATUS, 
  ACCESS_LEVEL 
} from '../types/models';

// Storage keys for secure persistence
const SUBSCRIPTION_KEY = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-subscription`;
const USER_PREFERENCES_KEY = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-user-preferences`;

/**
 * Subscription Store
 * Manages user subscription status, premium features access, and payment integration
 */
export const useSubscriptionStore = create((set, get) => ({
  // Subscription state
  isReady: false,
  isPremium: false,
  subscriptionTier: ACCESS_LEVEL.FREE,
  subscriptionStatus: SUBSCRIPTION_STATUS.INACTIVE,
  subscription: null,
  currentPeriodEnd: null,
  firstPurchaseDate: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  
  // Payment state
  isProcessingPayment: false,
  paymentError: null,
  
  // Loading states
  isLoadingSubscription: false,
  isLoadingPayment: false,
  
  // UI states
  isPaywallVisible: false,
  
  // Pricing configuration
  pricing: DEFAULT_PRICING,
  
  /**
   * Initialize subscription store by loading persisted data
   */
  initialize: async () => {
    try {
      set({ isLoadingSubscription: true });
      
      const storedSubscription = await SecureStore.getItemAsync(SUBSCRIPTION_KEY);
      if (storedSubscription) {
        const subscriptionData = JSON.parse(storedSubscription);
        
        // Check if subscription is still valid
        const isValidSubscription = get().validateSubscription(subscriptionData);
        
        if (isValidSubscription) {
          set({
            ...subscriptionData,
            isReady: true,
            isLoadingSubscription: false,
          });
        } else {
          // Clear invalid subscription
          await get().clearSubscription();
        }
      } else {
        set({ 
          isReady: true,
          isLoadingSubscription: false 
        });
      }
    } catch (error) {
      console.error('Failed to initialize subscription store:', error);
      set({ 
        isReady: true,
        isLoadingSubscription: false,
        paymentError: 'Failed to load subscription data'
      });
    }
  },
  
  /**
   * Validate subscription data
   */
  validateSubscription: (subscriptionData) => {
    if (!subscriptionData || !subscriptionData.currentPeriodEnd) {
      return false;
    }
    
    const currentDate = new Date();
    const periodEnd = new Date(subscriptionData.currentPeriodEnd);
    
    // Check if subscription has expired
    if (currentDate > periodEnd && subscriptionData.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Set subscription data and persist to secure storage
   */
  setSubscription: async (subscriptionData) => {
    try {
      const updatedState = {
        isPremium: subscriptionData.status === SUBSCRIPTION_STATUS.ACTIVE,
        subscriptionTier: subscriptionData.status === SUBSCRIPTION_STATUS.ACTIVE ? 'premium' : ACCESS_LEVEL.FREE,
        subscriptionStatus: subscriptionData.status,
        subscription: subscriptionData,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        firstPurchaseDate: subscriptionData.firstPurchaseDate || get().firstPurchaseDate,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        paymentError: null,
      };
      
      // Persist to secure storage
      await SecureStore.setItemAsync(SUBSCRIPTION_KEY, JSON.stringify(updatedState));
      
      set(updatedState);
      
      return true;
    } catch (error) {
      console.error('Failed to set subscription:', error);
      set({ paymentError: 'Failed to save subscription data' });
      return false;
    }
  },
  
  /**
   * Clear subscription data and remove from storage
   */
  clearSubscription: async () => {
    try {
      await SecureStore.deleteItemAsync(SUBSCRIPTION_KEY);
      
      set({
        isPremium: false,
        subscriptionTier: ACCESS_LEVEL.FREE,
        subscriptionStatus: SUBSCRIPTION_STATUS.INACTIVE,
        subscription: null,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        paymentError: null,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear subscription:', error);
      return false;
    }
  },
  
  /**
   * Update subscription status (for webhook updates)
   */
  updateSubscriptionStatus: async (status, periodEnd = null) => {
    try {
      const currentState = get();
      const updatedState = {
        ...currentState,
        subscriptionStatus: status,
        isPremium: status === SUBSCRIPTION_STATUS.ACTIVE,
        subscriptionTier: status === SUBSCRIPTION_STATUS.ACTIVE ? 'premium' : ACCESS_LEVEL.FREE,
        currentPeriodEnd: periodEnd || currentState.currentPeriodEnd,
      };
      
      // Update subscription object if it exists
      if (currentState.subscription) {
        updatedState.subscription = {
          ...currentState.subscription,
          status,
          currentPeriodEnd: periodEnd || currentState.subscription.currentPeriodEnd,
        };
      }
      
      await SecureStore.setItemAsync(SUBSCRIPTION_KEY, JSON.stringify(updatedState));
      set(updatedState);
      
      return true;
    } catch (error) {
      console.error('Failed to update subscription status:', error);
      return false;
    }
  },
  
  /**
   * Check if user is eligible for first-time discount
   */
  isEligibleForFirstTimeDiscount: () => {
    const { firstPurchaseDate } = get();
    return !firstPurchaseDate;
  },
  
  /**
   * Get applicable pricing for user
   */
  getApplicablePricing: () => {
    const { pricing, isEligibleForFirstTimeDiscount } = get();
    
    if (isEligibleForFirstTimeDiscount()) {
      return {
        ...pricing,
        monthly: pricing.firstTimeMonthly,
        isFirstTimeDiscount: true,
        discountAmount: pricing.monthly - pricing.firstTimeMonthly,
        discountPercentage: Math.round(((pricing.monthly - pricing.firstTimeMonthly) / pricing.monthly) * 100),
      };
    }
    
    return {
      ...pricing,
      isFirstTimeDiscount: false,
      discountAmount: 0,
      discountPercentage: 0,
    };
  },
  
  /**
   * Calculate price for subscription plan
   */
  calculatePrice: (plan = 'monthly') => {
    const applicablePricing = get().getApplicablePricing();
    
    if (plan === 'yearly') {
      return {
        amount: applicablePricing.yearly,
        currency: applicablePricing.currency,
        period: 'yearly',
        monthlyEquivalent: Math.round(applicablePricing.yearly / 12),
        savings: (applicablePricing.monthly * 12) - applicablePricing.yearly,
        discountPercentage: applicablePricing.yearlyDiscountPercent,
      };
    }
    
    return {
      amount: applicablePricing.monthly,
      currency: applicablePricing.currency,
      period: 'monthly',
      monthlyEquivalent: applicablePricing.monthly,
      savings: applicablePricing.isFirstTimeDiscount ? applicablePricing.discountAmount : 0,
      discountPercentage: applicablePricing.isFirstTimeDiscount ? applicablePricing.discountPercentage : 0,
    };
  },
  
  /**
   * Set payment processing state
   */
  setPaymentProcessing: (isProcessing, error = null) => {
    set({ 
      isProcessingPayment: isProcessing, 
      paymentError: error,
      isLoadingPayment: isProcessing 
    });
  },
  
  /**
   * Set first purchase date (for tracking discount eligibility)
   */
  setFirstPurchaseDate: async (date = new Date()) => {
    try {
      const currentState = get();
      
      if (!currentState.firstPurchaseDate) {
        const updatedState = {
          ...currentState,
          firstPurchaseDate: date,
        };
        
        await SecureStore.setItemAsync(SUBSCRIPTION_KEY, JSON.stringify(updatedState));
        set({ firstPurchaseDate: date });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to set first purchase date:', error);
      return false;
    }
  },
  
  /**
   * Check if subscription will expire soon (within 7 days)
   */
  isSubscriptionExpiringSoon: () => {
    const { currentPeriodEnd, subscriptionStatus } = get();
    
    if (!currentPeriodEnd || subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE) {
      return false;
    }
    
    const currentDate = new Date();
    const periodEnd = new Date(currentPeriodEnd);
    const daysUntilExpiry = Math.ceil((periodEnd - currentDate) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  },
  
  /**
   * Check if subscription has expired
   */
  isSubscriptionExpired: () => {
    const { currentPeriodEnd, subscriptionStatus } = get();
    
    if (!currentPeriodEnd) {
      return subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE;
    }
    
    const currentDate = new Date();
    const periodEnd = new Date(currentPeriodEnd);
    
    return currentDate > periodEnd;
  },
  
  /**
   * Get subscription summary for display
   */
  getSubscriptionSummary: () => {
    const { 
      isPremium, 
      subscriptionStatus, 
      currentPeriodEnd, 
      subscription,
      isSubscriptionExpiringSoon,
      isSubscriptionExpired
    } = get();
    
    if (!isPremium) {
      return {
        status: 'free',
        displayStatus: 'Free Plan',
        message: 'Upgrade to Premium for exclusive content and live streaming',
        showUpgrade: true,
        isExpired: false,
        isExpiringSoon: false,
      };
    }
    
    const expired = isSubscriptionExpired();
    const expiringSoon = isSubscriptionExpiringSoon();
    
    let displayStatus = 'Premium Active';
    let message = 'Enjoying premium features';
    let showUpgrade = false;
    
    if (expired) {
      displayStatus = 'Subscription Expired';
      message = 'Your premium subscription has expired. Renew to continue enjoying premium features.';
      showUpgrade = true;
    } else if (expiringSoon) {
      const daysLeft = Math.ceil((new Date(currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24));
      displayStatus = 'Premium Active';
      message = `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      showUpgrade = false;
    } else if (subscriptionStatus === SUBSCRIPTION_STATUS.PAST_DUE) {
      displayStatus = 'Payment Past Due';
      message = 'Please update your payment method to continue premium access';
      showUpgrade = true;
    }
    
    return {
      status: subscriptionStatus,
      displayStatus,
      message,
      showUpgrade,
      isExpired: expired,
      isExpiringSoon: expiringSoon,
      nextBillingDate: currentPeriodEnd,
      plan: subscription?.tier || 'premium',
    };
  },
  
  /**
   * Clear payment error
   */
  clearPaymentError: () => {
    set({ paymentError: null });
  },
  
  /**
   * Sync subscription with server
   */
  syncSubscription: async () => {
    try {
      set({ isLoadingSubscription: true });
      
      // This would make an API call to sync subscription status
      // For now, we'll just validate the current subscription
      const currentState = get();
      const isValid = get().validateSubscription(currentState);
      
      if (!isValid && currentState.subscription) {
        await get().clearSubscription();
      }
      
      set({ isLoadingSubscription: false });
      return true;
    } catch (error) {
      console.error('Failed to sync subscription:', error);
      set({ 
        isLoadingSubscription: false,
        paymentError: 'Failed to sync subscription status'
      });
      return false;
    }
  },
  
  // Paywall methods
  showPaywall: () => {
    set({ isPaywallVisible: true });
  },
  
  hidePaywall: () => {
    set({ isPaywallVisible: false });
  },
  
  // Subscription status methods
  loadSubscriptionStatus: async () => {
    const { initialize } = get();
    await initialize();
  },
  
  get isSubscribed() {
    return get().isPremium;
  },
}));

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
    subscriptionReminders: true,
    clubNewsUpdates: true,
  },
  
  // Usage tracking
  contentInteractions: {
    articlesRead: 0,
    streamingMinutes: 0,
    lastActiveDate: null,
    recentCategories: [],
    premiumContentAccessed: 0,
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
          subscriptionReminders: true,
          clubNewsUpdates: true,
        },
        contentInteractions: {
          articlesRead: 0,
          streamingMinutes: 0,
          lastActiveDate: null,
          recentCategories: [],
          premiumContentAccessed: 0,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear preferences:', error);
      return false;
    }
  },
}));