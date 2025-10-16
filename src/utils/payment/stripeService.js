/**
 * Stripe Payment Service
 * 
 * Handles all Stripe payment operations including subscription creation,
 * payment processing, and webhook handling for the mobile application.
 * 
 * Note: This implementation includes mock functions for demonstration.
 * In production, replace with actual Stripe SDK calls.
 */

import { Alert } from 'react-native';
import { DEFAULT_PRICING } from '../types/models';

/**
 * Mock Stripe configuration
 * In production, these would be actual Stripe keys
 */
const STRIPE_CONFIG = {
  // These should be loaded from environment variables
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  baseURL: process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000',
  apiVersion: '2023-10-16',
};

/**
 * Stripe Payment Service Class
 */
class StripeService {
  constructor() {
    this.isInitialized = false;
    this.stripe = null;
  }

  /**
   * Initialize Stripe SDK
   */
  async initialize() {
    try {
      // In production, you would initialize Stripe here:
      // import { initStripe } from '@stripe/stripe-react-native';
      // this.stripe = await initStripe({
      //   publishableKey: STRIPE_CONFIG.publishableKey,
      //   merchantIdentifier: 'merchant.com.pitchlink',
      //   urlScheme: 'pitchlink',
      // });
      
      // Mock initialization
      console.log('Stripe SDK initialized (mock)');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw new Error('Payment system initialization failed');
    }
  }

  /**
   * Create subscription payment intent
   */
  async createSubscriptionPaymentIntent(plan, userInfo, isFirstTime = false) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const pricing = this.calculatePricing(plan, isFirstTime);
      
      // Mock API call to backend
      const paymentIntentData = {
        amount: pricing.amount,
        currency: pricing.currency,
        plan: plan,
        isFirstTime,
        userId: userInfo.id,
        customerEmail: userInfo.email,
        metadata: {
          plan,
          isFirstTime: isFirstTime.toString(),
          userId: userInfo.id,
        },
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful response
      const mockResponse = {
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        subscriptionId: `sub_mock_${Date.now()}`,
        customerId: `cus_mock_${Date.now()}`,
        status: 'requires_payment_method',
        amount: pricing.amount,
        currency: pricing.currency,
      };

      return mockResponse;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(paymentIntentData, paymentMethodData) {
    try {
      // In production, use Stripe SDK:
      // const { error, paymentIntent } = await this.stripe.confirmPayment(
      //   paymentIntentData.clientSecret,
      //   {
      //     paymentMethodType: 'Card',
      //     paymentMethodData: paymentMethodData,
      //   }
      // );

      // Mock payment processing
      console.log('Processing payment (mock):', {
        paymentIntentId: paymentIntentData.paymentIntentId,
        amount: paymentIntentData.amount,
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock random success/failure for testing
      const shouldSucceed = Math.random() > 0.1; // 90% success rate

      if (!shouldSucceed) {
        throw new Error('Your card was declined. Please try a different payment method.');
      }

      // Mock successful payment response
      const successResponse = {
        paymentIntent: {
          id: paymentIntentData.paymentIntentId,
          status: 'succeeded',
          amount: paymentIntentData.amount,
          currency: paymentIntentData.currency,
        },
        subscription: {
          id: paymentIntentData.subscriptionId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          customerId: paymentIntentData.customerId,
        },
        success: true,
      };

      return successResponse;
    } catch (error) {
      console.error('Payment processing failed:', error);
      
      // Handle specific Stripe errors
      if (error.message?.includes('declined')) {
        throw new Error('Your card was declined. Please check your card details or try a different payment method.');
      } else if (error.message?.includes('insufficient_funds')) {
        throw new Error('Insufficient funds. Please check your account balance or use a different card.');
      } else if (error.message?.includes('expired_card')) {
        throw new Error('Your card has expired. Please use a different payment method.');
      } else if (error.message?.includes('incorrect_cvc')) {
        throw new Error('The security code is incorrect. Please check and try again.');
      }
      
      throw new Error(error.message || 'Payment failed. Please try again.');
    }
  }

  /**
   * Create customer in Stripe
   */
  async createCustomer(userInfo) {
    try {
      // Mock API call to create Stripe customer
      console.log('Creating Stripe customer (mock):', userInfo.email);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: `cus_mock_${Date.now()}`,
        email: userInfo.email,
        created: new Date(),
      };
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw new Error('Failed to create customer account.');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = 'user_request') {
    try {
      console.log('Cancelling subscription (mock):', subscriptionId);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: subscriptionId,
        status: 'canceled',
        canceledAt: new Date(),
        cancelAtPeriodEnd: true,
        reason,
      };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription. Please try again.');
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(subscriptionId) {
    try {
      console.log('Reactivating subscription (mock):', subscriptionId);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: subscriptionId,
        status: 'active',
        cancelAtPeriodEnd: false,
        reactivatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw new Error('Failed to reactivate subscription. Please try again.');
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(customerId, paymentMethodData) {
    try {
      console.log('Updating payment method (mock):', customerId);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        id: `pm_mock_${Date.now()}`,
        customerId,
        type: paymentMethodData.type || 'card',
        card: {
          brand: paymentMethodData.brand || 'visa',
          last4: paymentMethodData.last4 || '4242',
          expMonth: paymentMethodData.expMonth || 12,
          expYear: paymentMethodData.expYear || 2025,
        },
        isDefault: true,
      };
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw new Error('Failed to update payment method. Please try again.');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      console.log('Fetching subscription (mock):', subscriptionId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: subscriptionId,
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        plan: 'premium',
        amount: DEFAULT_PRICING.monthly,
        currency: DEFAULT_PRICING.currency,
      };
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      throw new Error('Failed to fetch subscription details.');
    }
  }

  /**
   * Calculate pricing based on plan and user status
   */
  calculatePricing(plan, isFirstTime = false) {
    const pricing = { ...DEFAULT_PRICING };
    
    let amount;
    let period;
    
    if (plan === 'yearly') {
      amount = pricing.yearly;
      period = 'year';
    } else {
      amount = isFirstTime ? pricing.firstTimeMonthly : pricing.monthly;
      period = 'month';
    }
    
    return {
      amount,
      currency: pricing.currency,
      period,
      originalAmount: plan === 'monthly' ? pricing.monthly : pricing.yearly,
      discount: isFirstTime && plan === 'monthly' ? pricing.monthly - pricing.firstTimeMonthly : 0,
      isDiscounted: isFirstTime && plan === 'monthly',
    };
  }

  /**
   * Format price for display
   */
  formatPrice(amount, currency = 'NGN') {
    return `₦${(amount / 100).toLocaleString()}`;
  }

  /**
   * Validate card data
   */
  validateCardData(cardData) {
    const errors = [];
    
    // Validate card number (basic check)
    if (!cardData.number || cardData.number.length < 13) {
      errors.push('Invalid card number');
    }
    
    // Validate expiry
    if (!cardData.expMonth || !cardData.expYear) {
      errors.push('Invalid expiry date');
    } else {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      if (cardData.expYear < currentYear || 
          (cardData.expYear === currentYear && cardData.expMonth < currentMonth)) {
        errors.push('Card has expired');
      }
    }
    
    // Validate CVC
    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.push('Invalid security code');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event) {
    try {
      console.log('Processing webhook event (mock):', event.type);
      
      switch (event.type) {
        case 'invoice.payment_succeeded':
          return this.handlePaymentSucceeded(event.data.object);
        
        case 'invoice.payment_failed':
          return this.handlePaymentFailed(event.data.object);
        
        case 'customer.subscription.updated':
          return this.handleSubscriptionUpdated(event.data.object);
        
        case 'customer.subscription.deleted':
          return this.handleSubscriptionDeleted(event.data.object);
        
        default:
          console.log('Unhandled webhook event:', event.type);
          return { handled: false };
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSucceeded(invoice) {
    console.log('Payment succeeded webhook (mock):', invoice.id);
    
    return {
      handled: true,
      subscriptionId: invoice.subscription,
      status: 'active',
      message: 'Payment processed successfully',
    };
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailed(invoice) {
    console.log('Payment failed webhook (mock):', invoice.id);
    
    return {
      handled: true,
      subscriptionId: invoice.subscription,
      status: 'past_due',
      message: 'Payment failed - subscription past due',
    };
  }

  /**
   * Handle subscription updated webhook
   */
  async handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated webhook (mock):', subscription.id);
    
    return {
      handled: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      message: 'Subscription updated',
    };
  }

  /**
   * Handle subscription deleted webhook
   */
  async handleSubscriptionDeleted(subscription) {
    console.log('Subscription deleted webhook (mock):', subscription.id);
    
    return {
      handled: true,
      subscriptionId: subscription.id,
      status: 'canceled',
      message: 'Subscription canceled',
    };
  }

  /**
   * Get payment methods for customer
   */
  async getPaymentMethods(customerId) {
    try {
      console.log('Fetching payment methods (mock):', customerId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: 'pm_mock_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025,
          },
          isDefault: true,
        },
      ];
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      throw new Error('Failed to fetch payment methods.');
    }
  }

  /**
   * Show native payment sheet (iOS/Android)
   */
  async showPaymentSheet(paymentIntentData) {
    try {
      // In production, use Stripe SDK:
      // const { error } = await this.stripe.presentPaymentSheet();
      
      console.log('Showing payment sheet (mock)');
      
      // Simulate user payment flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      return {
        paymentIntent: {
          id: paymentIntentData.paymentIntentId,
          status: 'succeeded',
        },
        error: null,
      };
    } catch (error) {
      console.error('Payment sheet failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export utility functions
export const formatPrice = (amount, currency = 'NGN') => {
  return `₦${(amount / 100).toLocaleString()}`;
};

export const calculateDiscount = (originalPrice, discountedPrice) => {
  const discount = originalPrice - discountedPrice;
  const percentage = Math.round((discount / originalPrice) * 100);
  return { discount, percentage };
};

export const isValidCardNumber = (number) => {
  // Basic Luhn algorithm check
  const cleanNumber = number.replace(/\s/g, '');
  if (!/^\d+$/.test(cleanNumber) || cleanNumber.length < 13) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export default stripeService;