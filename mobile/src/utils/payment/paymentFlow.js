/**
 * Payment Flow Orchestrator
 * 
 * Manages the complete payment flow for subscriptions including
 * error handling, retry mechanisms, and state management.
 */

import { Alert } from 'react-native';
import { stripeService } from './stripeService';
import { useSubscriptionStore } from '../subscription/store';
import { useAuthStore } from '../auth/store';

/**
 * Payment Flow Manager Class
 */
class PaymentFlowManager {
  constructor() {
    this.activePayment = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize subscription payment flow
   */
  async initiateSubscriptionPayment(plan, options = {}) {
    const {
      isFirstTime = false,
      retryAttempt = false,
      onProgress = () => {},
      onSuccess = () => {},
      onError = () => {},
    } = options;

    try {
      // Get user and subscription stores
      const { auth } = useAuthStore.getState();
      const { 
        setPaymentProcessing, 
        setFirstPurchaseDate,
        setSubscription,
        getApplicablePricing 
      } = useSubscriptionStore.getState();

      if (!auth) {
        throw new Error('User must be authenticated to purchase subscription');
      }

      // Set loading state
      setPaymentProcessing(true);
      onProgress({ step: 'initializing', progress: 10 });

      // Calculate pricing
      const pricing = getApplicablePricing();
      const amount = plan === 'yearly' ? pricing.yearly : 
                   (isFirstTime ? pricing.firstTimeMonthly : pricing.monthly);

      onProgress({ step: 'creating_intent', progress: 30 });

      // Create payment intent
      const paymentIntentData = await stripeService.createSubscriptionPaymentIntent(
        plan,
        auth,
        isFirstTime
      );

      this.activePayment = {
        paymentIntentData,
        plan,
        isFirstTime,
        userId: auth.id,
        startTime: new Date(),
      };

      onProgress({ step: 'payment_ready', progress: 50 });

      // Show payment sheet
      const paymentResult = await this.processPayment(paymentIntentData);

      onProgress({ step: 'processing', progress: 80 });

      // Handle successful payment
      if (paymentResult.success) {
        // Update subscription in store
        await this.handlePaymentSuccess(paymentResult, plan, isFirstTime);
        
        onProgress({ step: 'complete', progress: 100 });
        onSuccess(paymentResult);
        
        return paymentResult;
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment flow error:', error);
      
      // Handle retryable errors
      if (this.shouldRetryPayment(error) && !retryAttempt) {
        return this.retryPaymentFlow(plan, options, error);
      }
      
      // Handle final error
      const { setPaymentProcessing } = useSubscriptionStore.getState();
      setPaymentProcessing(false, error.message);
      
      onError(error);
      this.activePayment = null;
      
      throw error;
    }
  }

  /**
   * Process payment using Stripe
   */
  async processPayment(paymentIntentData) {
    try {
      // For mock implementation, we'll simulate the payment process
      const result = await stripeService.showPaymentSheet(paymentIntentData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Process the payment on the backend
      const paymentResult = await stripeService.processSubscriptionPayment(
        paymentIntentData,
        { type: 'card' } // Mock payment method
      );

      return {
        success: true,
        paymentIntent: paymentResult.paymentIntent,
        subscription: paymentResult.subscription,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentResult, plan, isFirstTime) {
    const { 
      setSubscription, 
      setFirstPurchaseDate 
    } = useSubscriptionStore.getState();

    try {
      // Create subscription data
      const subscriptionData = {
        id: paymentResult.subscription.id,
        status: paymentResult.subscription.status,
        currentPeriodStart: paymentResult.subscription.currentPeriodStart,
        currentPeriodEnd: paymentResult.subscription.currentPeriodEnd,
        stripeCustomerId: paymentResult.subscription.customerId,
        stripeSubscriptionId: paymentResult.subscription.id,
        plan,
        isFirstTime,
      };

      // Update subscription in store
      await setSubscription(subscriptionData);

      // Set first purchase date if this is the first time
      if (isFirstTime) {
        await setFirstPurchaseDate();
      }

      // Track successful payment analytics
      this.trackPaymentSuccess({
        plan,
        amount: paymentResult.paymentIntent.amount,
        isFirstTime,
        paymentMethod: 'card',
      });

      console.log('Payment successful:', {
        subscriptionId: paymentResult.subscription.id,
        plan,
        amount: paymentResult.paymentIntent.amount,
      });

    } catch (error) {
      console.error('Failed to handle payment success:', error);
      // Don't throw here as payment was successful
    }
  }

  /**
   * Determine if payment should be retried
   */
  shouldRetryPayment(error) {
    const retryableErrors = [
      'network_error',
      'processing_error',
      'temporary_failure',
      'rate_limit_error',
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError)
    ) && this.retryCount < this.maxRetries;
  }

  /**
   * Retry payment flow with exponential backoff
   */
  async retryPaymentFlow(plan, options, originalError) {
    this.retryCount++;
    
    const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
    
    console.log(`Retrying payment (attempt ${this.retryCount}/${this.maxRetries}) after ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.initiateSubscriptionPayment(plan, {
      ...options,
      retryAttempt: true,
    });
  }

  /**
   * Cancel active payment
   */
  async cancelPayment() {
    if (this.activePayment) {
      try {
        // Cancel payment intent if possible
        console.log('Cancelling active payment:', this.activePayment.paymentIntentData.paymentIntentId);
        
        const { setPaymentProcessing } = useSubscriptionStore.getState();
        setPaymentProcessing(false);
        
        this.activePayment = null;
        this.retryCount = 0;
        
        return true;
      } catch (error) {
        console.error('Failed to cancel payment:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Handle payment errors with user-friendly messages
   */
  handlePaymentError(error) {
    const errorMappings = {
      'card_declined': {
        title: 'Card Declined',
        message: 'Your card was declined. Please check your card details or try a different payment method.',
        actions: ['retry', 'change_card'],
      },
      'insufficient_funds': {
        title: 'Insufficient Funds',
        message: 'Your card has insufficient funds. Please check your account balance or use a different card.',
        actions: ['change_card'],
      },
      'expired_card': {
        title: 'Card Expired',
        message: 'Your card has expired. Please use a different payment method.',
        actions: ['change_card'],
      },
      'incorrect_cvc': {
        title: 'Invalid Security Code',
        message: 'The security code (CVC) is incorrect. Please check and try again.',
        actions: ['retry'],
      },
      'processing_error': {
        title: 'Processing Error',
        message: 'There was an error processing your payment. Please try again.',
        actions: ['retry'],
      },
      'network_error': {
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        actions: ['retry'],
      },
    };

    const errorType = this.categorizeError(error);
    const errorInfo = errorMappings[errorType] || {
      title: 'Payment Error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      actions: ['retry'],
    };

    return {
      ...errorInfo,
      canRetry: errorInfo.actions.includes('retry') && this.retryCount < this.maxRetries,
      originalError: error,
    };
  }

  /**
   * Categorize error for appropriate handling
   */
  categorizeError(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('declined')) return 'card_declined';
    if (message.includes('insufficient')) return 'insufficient_funds';
    if (message.includes('expired')) return 'expired_card';
    if (message.includes('cvc') || message.includes('security code')) return 'incorrect_cvc';
    if (message.includes('network') || message.includes('connection')) return 'network_error';
    if (message.includes('processing')) return 'processing_error';
    
    return 'unknown_error';
  }

  /**
   * Show error alert with retry options
   */
  showPaymentErrorAlert(error, onRetry, onCancel) {
    const errorInfo = this.handlePaymentError(error);
    
    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
    ];

    if (errorInfo.canRetry) {
      buttons.push({
        text: 'Retry',
        onPress: onRetry,
      });
    }

    if (errorInfo.actions.includes('change_card')) {
      buttons.push({
        text: 'Change Card',
        onPress: () => {
          // Navigate to payment method selection
          console.log('Navigate to payment method selection');
        },
      });
    }

    Alert.alert(
      errorInfo.title,
      errorInfo.message,
      buttons
    );
  }

  /**
   * Track payment success for analytics
   */
  trackPaymentSuccess(data) {
    try {
      // In production, send to analytics service
      console.log('Payment success analytics:', {
        event: 'subscription_payment_success',
        properties: {
          plan: data.plan,
          amount: data.amount,
          currency: 'NGN',
          is_first_time: data.isFirstTime,
          payment_method: data.paymentMethod,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to track payment success:', error);
    }
  }

  /**
   * Track payment failure for analytics
   */
  trackPaymentFailure(data) {
    try {
      // In production, send to analytics service
      console.log('Payment failure analytics:', {
        event: 'subscription_payment_failure',
        properties: {
          plan: data.plan,
          error_type: data.errorType,
          error_message: data.errorMessage,
          retry_count: this.retryCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to track payment failure:', error);
    }
  }

  /**
   * Get payment status
   */
  getPaymentStatus() {
    if (!this.activePayment) {
      return { status: 'idle' };
    }

    return {
      status: 'processing',
      plan: this.activePayment.plan,
      startTime: this.activePayment.startTime,
      retryCount: this.retryCount,
    };
  }

  /**
   * Reset payment flow state
   */
  reset() {
    this.activePayment = null;
    this.retryCount = 0;
  }
}

/**
 * Subscription Management Functions
 */

/**
 * Cancel subscription with confirmation
 */
export const cancelSubscription = async (subscriptionId, reason = 'user_request') => {
  try {
    const result = await new Promise((resolve) => {
      Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel your premium subscription? You\'ll lose access to premium features at the end of your current billing period.',
        [
          {
            text: 'Keep Subscription',
            style: 'cancel',
            onPress: () => resolve({ cancelled: true }),
          },
          {
            text: 'Cancel Subscription',
            style: 'destructive',
            onPress: () => resolve({ cancelled: false }),
          },
        ]
      );
    });

    if (result.cancelled) {
      return { success: false, cancelled: true };
    }

    // Cancel subscription via Stripe
    const cancellationResult = await stripeService.cancelSubscription(subscriptionId, reason);
    
    // Update local state
    const { updateSubscriptionStatus } = useSubscriptionStore.getState();
    await updateSubscriptionStatus('cancelled');

    Alert.alert(
      'Subscription Cancelled',
      'Your subscription has been cancelled. You\'ll continue to have premium access until the end of your current billing period.',
      [{ text: 'OK' }]
    );

    return { success: true, result: cancellationResult };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    Alert.alert(
      'Cancellation Failed',
      'Failed to cancel your subscription. Please try again or contact support.',
      [{ text: 'OK' }]
    );
    throw error;
  }
};

/**
 * Reactivate cancelled subscription
 */
export const reactivateSubscription = async (subscriptionId) => {
  try {
    const result = await stripeService.reactivateSubscription(subscriptionId);
    
    const { updateSubscriptionStatus } = useSubscriptionStore.getState();
    await updateSubscriptionStatus('active');

    Alert.alert(
      'Subscription Reactivated',
      'Welcome back! Your premium subscription has been reactivated.',
      [{ text: 'Great!' }]
    );

    return { success: true, result };
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    Alert.alert(
      'Reactivation Failed',
      'Failed to reactivate your subscription. Please try again or contact support.',
      [{ text: 'OK' }]
    );
    throw error;
  }
};

/**
 * Update payment method
 */
export const updatePaymentMethod = async (customerId, paymentMethodData) => {
  try {
    const result = await stripeService.updatePaymentMethod(customerId, paymentMethodData);
    
    Alert.alert(
      'Payment Method Updated',
      'Your payment method has been successfully updated.',
      [{ text: 'OK' }]
    );

    return { success: true, result };
  } catch (error) {
    console.error('Failed to update payment method:', error);
    Alert.alert(
      'Update Failed',
      'Failed to update your payment method. Please try again.',
      [{ text: 'OK' }]
    );
    throw error;
  }
};

// Export singleton instance
export const paymentFlowManager = new PaymentFlowManager();

// Export utility functions
export const formatPriceWithDiscount = (originalPrice, discountedPrice) => {
  const savings = originalPrice - discountedPrice;
  const percentage = Math.round((savings / originalPrice) * 100);
  
  return {
    original: `₦${(originalPrice / 100).toLocaleString()}`,
    discounted: `₦${(discountedPrice / 100).toLocaleString()}`,
    savings: `₦${(savings / 100).toLocaleString()}`,
    percentage: `${percentage}%`,
  };
};

export const getSubscriptionBenefits = (plan) => {
  const baseBenefits = [
    'Live match streaming in HD',
    'Unlimited premium articles',
    'Personalized content feed',
    'Ad-free experience',
    'Exclusive analysis and insights',
    'Early access to breaking news',
  ];

  if (plan === 'yearly') {
    baseBenefits.push('20% savings vs monthly');
    baseBenefits.push('Priority customer support');
  }

  return baseBenefits;
};

export default paymentFlowManager;