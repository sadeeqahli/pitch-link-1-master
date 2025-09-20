/**
 * Premium Features Test Suite
 * 
 * Tests for subscription store, payment flows, and premium content access
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscriptionStore, useUserPreferencesStore } from '../src/utils/subscription/store';
import { useContentStore } from '../src/utils/content/store';
import { paymentFlowManager } from '../src/utils/payment/paymentFlow';
import { generatePersonalizedFeed, calculateContentRelevance } from '../src/utils/content/personalization';
import { DEFAULT_PRICING, SUBSCRIPTION_STATUS, ACCESS_LEVEL } from '../src/utils/types/models';

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(true),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(true),
}));

describe('Premium Features Test Suite', () => {
  
  describe('Subscription Store', () => {
    beforeEach(() => {
      // Reset store state
      useSubscriptionStore.getState().clearSubscription();
    });

    test('should initialize with default free state', () => {
      const { result } = renderHook(() => useSubscriptionStore());
      
      expect(result.current.isPremium).toBe(false);
      expect(result.current.subscriptionTier).toBe(ACCESS_LEVEL.FREE);
      expect(result.current.subscriptionStatus).toBe(SUBSCRIPTION_STATUS.INACTIVE);
    });

    test('should calculate first-time discount pricing correctly', () => {
      const { result } = renderHook(() => useSubscriptionStore());
      
      const pricing = result.current.getApplicablePricing();
      
      expect(pricing.isFirstTimeDiscount).toBe(true);
      expect(pricing.monthly).toBe(DEFAULT_PRICING.firstTimeMonthly);
      expect(pricing.discountAmount).toBe(DEFAULT_PRICING.monthly - DEFAULT_PRICING.firstTimeMonthly);
    });

    test('should set subscription correctly', async () => {
      const { result } = renderHook(() => useSubscriptionStore());
      
      const mockSubscription = {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      };

      await act(async () => {
        await result.current.setSubscription(mockSubscription);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.subscriptionTier).toBe('premium');
      expect(result.current.subscriptionStatus).toBe(SUBSCRIPTION_STATUS.ACTIVE);
    });

    test('should detect subscription expiration', () => {
      const { result } = renderHook(() => useSubscriptionStore());
      
      act(() => {
        result.current.setSubscription({
          status: SUBSCRIPTION_STATUS.ACTIVE,
          currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        });
      });

      expect(result.current.isSubscriptionExpired()).toBe(true);
    });

    test('should generate subscription summary correctly', () => {
      const { result } = renderHook(() => useSubscriptionStore());
      
      const summary = result.current.getSubscriptionSummary();
      
      expect(summary.status).toBe('free');
      expect(summary.showUpgrade).toBe(true);
      expect(summary.displayStatus).toBe('Free Plan');
    });
  });

  describe('User Preferences Store', () => {
    beforeEach(() => {
      useUserPreferencesStore.getState().clearPreferences();
    });

    test('should set favorite club correctly', async () => {
      const { result } = renderHook(() => useUserPreferencesStore());
      
      const mockClub = {
        id: 'arsenal',
        name: 'Arsenal',
        league: 'Premier League',
        logoUrl: 'https://example.com/arsenal.png',
      };

      await act(async () => {
        await result.current.setFavoriteClub(mockClub);
      });

      expect(result.current.favoriteClub).toEqual(mockClub);
      expect(result.current.hasSelectedClub).toBe(true);
    });

    test('should update content interactions', async () => {
      const { result } = renderHook(() => useUserPreferencesStore());
      
      await act(async () => {
        await result.current.updateContentInteractions({
          articlesRead: 5,
          category: 'Transfer News',
        });
      });

      expect(result.current.contentInteractions.articlesRead).toBe(5);
      expect(result.current.contentInteractions.recentCategories).toContain('Transfer News');
    });
  });

  describe('Content Store', () => {
    test('should check content access correctly', () => {
      const { result } = renderHook(() => useContentStore());
      
      const freeArticle = { isPremium: false };
      const premiumArticle = { isPremium: true };
      
      const freeAccess = result.current.canAccessContent(freeArticle, false);
      const premiumAccessWithoutSub = result.current.canAccessContent(premiumArticle, false);
      const premiumAccessWithSub = result.current.canAccessContent(premiumArticle, true);
      
      expect(freeAccess.canAccess).toBe(true);
      expect(premiumAccessWithoutSub.canAccess).toBe(false);
      expect(premiumAccessWithSub.canAccess).toBe(true);
    });

    test('should generate content preview for premium articles', () => {
      const { result } = renderHook(() => useContentStore());
      
      const premiumArticle = {
        isPremium: true,
        content: 'Full premium content',
        premiumPreview: 'Preview text',
      };
      
      const previewForFree = result.current.getContentPreview(premiumArticle, false);
      const previewForPremium = result.current.getContentPreview(premiumArticle, true);
      
      expect(previewForFree.isFullContent).toBe(false);
      expect(previewForFree.showPaywall).toBe(true);
      expect(previewForPremium.isFullContent).toBe(true);
      expect(previewForPremium.showPaywall).toBe(false);
    });
  });

  describe('Content Personalization', () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Arsenal Transfer News',
        category: 'Transfer News',
        relatedClubs: ['arsenal'],
        publishedAt: new Date(),
        isPremium: false,
        views: 1000,
      },
      {
        id: '2', 
        title: 'Champions League Update',
        category: 'Champions League',
        relatedClubs: ['arsenal', 'chelsea'],
        publishedAt: new Date(),
        isPremium: true,
        views: 2000,
      },
    ];

    const mockUserPreferences = {
      favoriteClub: { id: 'arsenal', name: 'Arsenal' },
      contentInteractions: {
        recentCategories: ['Transfer News'],
      },
    };

    test('should calculate content relevance correctly', () => {
      const relevanceScore1 = calculateContentRelevance(
        mockArticles[0], 
        mockUserPreferences, 
        false
      );
      
      const relevanceScore2 = calculateContentRelevance(
        mockArticles[1], 
        mockUserPreferences, 
        true
      );
      
      // Arsenal article should have high relevance
      expect(relevanceScore1).toBeGreaterThan(50);
      
      // Premium Champions League article should have high relevance for premium user
      expect(relevanceScore2).toBeGreaterThan(60);
    });

    test('should generate personalized feed', () => {
      const personalizedFeed = generatePersonalizedFeed(
        mockArticles,
        mockUserPreferences,
        true,
        10
      );
      
      expect(personalizedFeed).toHaveLength(2);
      expect(personalizedFeed[0].relevanceScore).toBeDefined();
      
      // Arsenal-related content should be first due to club preference
      expect(personalizedFeed[0].relatedClubs).toContain('arsenal');
    });
  });

  describe('Payment Flow Manager', () => {
    beforeEach(() => {
      paymentFlowManager.reset();
    });

    test('should initialize payment flow correctly', async () => {
      const mockOptions = {
        isFirstTime: true,
        onProgress: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn(),
      };

      // Mock successful payment
      jest.spyOn(paymentFlowManager, 'processPayment').mockResolvedValue({
        success: true,
        paymentIntent: { id: 'pi_test123', amount: 37000 },
        subscription: { id: 'sub_test123', status: 'active' },
      });

      await paymentFlowManager.initiateSubscriptionPayment('monthly', mockOptions);
      
      expect(mockOptions.onProgress).toHaveBeenCalled();
      expect(mockOptions.onSuccess).toHaveBeenCalled();
    });

    test('should handle payment errors correctly', () => {
      const testError = new Error('card_declined');
      const errorInfo = paymentFlowManager.handlePaymentError(testError);
      
      expect(errorInfo.title).toBe('Card Declined');
      expect(errorInfo.actions).toContain('retry');
    });

    test('should categorize errors correctly', () => {
      const declinedError = new Error('Your card was declined');
      const networkError = new Error('network connection failed');
      
      expect(paymentFlowManager.categorizeError(declinedError)).toBe('card_declined');
      expect(paymentFlowManager.categorizeError(networkError)).toBe('network_error');
    });

    test('should determine retry eligibility', () => {
      const retryableError = new Error('network_error');
      const nonRetryableError = new Error('card_declined');
      
      expect(paymentFlowManager.shouldRetryPayment(retryableError)).toBe(true);
      expect(paymentFlowManager.shouldRetryPayment(nonRetryableError)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should complete full subscription flow', async () => {
      const subscriptionStore = renderHook(() => useSubscriptionStore());
      const preferencesStore = renderHook(() => useUserPreferencesStore());
      
      // 1. Start as free user
      expect(subscriptionStore.result.current.isPremium).toBe(false);
      
      // 2. Subscribe
      const mockSubscription = {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      };

      await act(async () => {
        await subscriptionStore.result.current.setSubscription(mockSubscription);
      });

      expect(subscriptionStore.result.current.isPremium).toBe(true);
      
      // 3. Set favorite club
      const mockClub = {
        id: 'arsenal',
        name: 'Arsenal',
        league: 'Premier League',
        logoUrl: 'https://example.com/arsenal.png',
      };

      await act(async () => {
        await preferencesStore.result.current.setFavoriteClub(mockClub);
      });

      expect(preferencesStore.result.current.favoriteClub).toEqual(mockClub);
      
      // 4. Verify premium access
      const contentStore = renderHook(() => useContentStore());
      const premiumArticle = { isPremium: true };
      const access = contentStore.result.current.canAccessContent(premiumArticle, true);
      
      expect(access.canAccess).toBe(true);
    });
  });
});