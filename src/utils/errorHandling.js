import { create } from 'zustand';

/**
 * Error handling utilities and store for the PitchLink mobile app
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION', 
  AUTHENTICATION: 'AUTHENTICATION',
  BOOKING: 'BOOKING',
  PAYMENT: 'PAYMENT',
  GENERAL: 'GENERAL',
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// Create error object
export const createError = (type, message, severity = ERROR_SEVERITY.MEDIUM, details = {}) => ({
  id: Date.now().toString(),
  type,
  message,
  severity,
  details,
  timestamp: new Date().toISOString(),
});

// User-friendly error messages
export const getErrorMessage = (error) => {
  const errorMessages = {
    [ERROR_TYPES.NETWORK]: 'Please check your internet connection and try again.',
    [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
    [ERROR_TYPES.AUTHENTICATION]: 'Please sign in again to continue.',
    [ERROR_TYPES.BOOKING]: 'There was an issue with your booking. Please try again.',
    [ERROR_TYPES.PAYMENT]: 'Payment failed. Please check your payment method.',
    [ERROR_TYPES.GENERAL]: 'Something went wrong. Please try again.',
  };
  
  return error.message || errorMessages[error.type] || errorMessages[ERROR_TYPES.GENERAL];
};

/**
 * Global Error Store
 */
export const useErrorStore = create((set, get) => ({
  errors: [],
  isShowingError: false,
  currentError: null,

  // Add error
  addError: (type, message, severity = ERROR_SEVERITY.MEDIUM, details = {}) => {
    const error = createError(type, message, severity, details);
    set(state => ({
      errors: [error, ...state.errors.slice(0, 9)], // Keep last 10 errors
      currentError: error,
      isShowingError: true,
    }));
    
    // Auto-dismiss low severity errors
    if (severity === ERROR_SEVERITY.LOW) {
      setTimeout(() => {
        get().dismissError();
      }, 3000);
    }
    
    return error;
  },

  // Dismiss current error
  dismissError: () => {
    set({
      isShowingError: false,
      currentError: null,
    });
  },

  // Clear all errors
  clearErrors: () => {
    set({
      errors: [],
      isShowingError: false,
      currentError: null,
    });
  },

  // Get errors by type
  getErrorsByType: (type) => {
    return get().errors.filter(error => error.type === type);
  },
}));

// Async operation wrapper with error handling
export const withErrorHandling = async (operation, errorType = ERROR_TYPES.GENERAL) => {
  const { addError } = useErrorStore.getState();
  
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${errorType}:`, error);
    
    let errorMessage = error.message;
    let severity = ERROR_SEVERITY.MEDIUM;
    
    // Categorize common errors
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      errorMessage = 'Network connection failed';
      errorType = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.HIGH;
    } else if (error.status === 401) {
      errorMessage = 'Authentication required';
      errorType = ERROR_TYPES.AUTHENTICATION;
      severity = ERROR_SEVERITY.HIGH;
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Invalid request';
      errorType = ERROR_TYPES.VALIDATION;
    } else if (error.status >= 500) {
      errorMessage = 'Server error';
      severity = ERROR_SEVERITY.HIGH;
    }
    
    addError(errorType, errorMessage, severity, {
      originalError: error.message,
      stack: error.stack,
    });
    
    throw error;
  }
};

// Loading state management
export const useLoadingStore = create((set) => ({
  loadingStates: {},
  
  setLoading: (key, isLoading) => {
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    }));
  },
  
  isLoading: (key) => {
    return useLoadingStore.getState().loadingStates[key] || false;
  },
  
  clearLoading: () => {
    set({ loadingStates: {} });
  },
}));