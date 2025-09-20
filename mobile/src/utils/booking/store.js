import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '../auth/userStore';

// Booking data model structure
const createBookingData = (data) => ({
  id: data.id || Date.now().toString(),
  pitchName: data.pitchName,
  pitchImage: data.pitchImage,
  date: data.date,
  time: data.time,
  duration: data.duration || 1, // 1, 2, or 3 hours
  location: data.location,
  price: data.price,
  basePricePerHour: data.basePricePerHour,
  totalPrice: data.totalPrice,
  status: data.status || 'confirmed', // confirmed, completed, cancelled
  bookingRef: data.bookingRef || generateBookingRef(),
  receipt: data.receipt || null,
  pitchType: data.pitchType || '5-a-side',
  surface: data.surface || 'Artificial Grass',
  amenities: data.amenities || [],
  venueContact: data.venueContact || '',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// Generate unique booking reference
const generateBookingRef = () => {
  const prefix = 'PL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Calculate enhanced pricing based on duration and first-time booking status
export const calculatePricing = (basePricePerHour, duration, isFirstBooking = false) => {
  const multipliers = {
    1: 1.0,    // No discount for 1 hour
    2: 1.8,    // 10% discount for 2 hours
    3: 2.5,    // 16.7% discount for 3 hours
  };
  
  const multiplier = multipliers[duration] || 1.0;
  const baseTotal = basePricePerHour * multiplier;
  const serviceFee = 2500; // Fixed service fee in Naira
  const transactionFee = serviceFee; // Alias for clarity
  
  // Calculate first-time booking discount (10% off subtotal)
  const firstBookingDiscount = isFirstBooking ? baseTotal * 0.1 : 0;
  
  // Calculate duration discount (existing logic)
  const durationDiscount = duration > 1 ? (basePricePerHour * duration - baseTotal) : 0;
  
  const total = baseTotal - firstBookingDiscount + serviceFee;
  
  return {
    basePricePerHour,
    duration,
    subtotal: baseTotal,
    serviceFee,
    transactionFee,
    firstBookingDiscount,
    durationDiscount,
    total,
    discount: firstBookingDiscount + durationDiscount,
    isFirstBooking,
    breakdown: {
      hourlyRate: basePricePerHour,
      hours: duration,
      beforeDiscount: baseTotal,
      firstTimeSavings: firstBookingDiscount,
      durationSavings: durationDiscount,
      totalSavings: firstBookingDiscount + durationDiscount,
      finalTotal: total,
    },
  };
};

// Generate receipt data
const generateReceipt = (booking, pricing) => ({
  bookingId: booking.id,
  bookingRef: booking.bookingRef,
  issueDate: new Date().toISOString(),
  status: 'APPROVED',
  qrCode: `pitchlink://booking/${booking.id}?ref=${booking.bookingRef}`,
  pitchDetails: {
    name: booking.pitchName,
    image: booking.pitchImage,
    location: booking.location,
    type: booking.pitchType,
    surface: booking.surface,
    amenities: booking.amenities,
  },
  bookingDetails: {
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    status: booking.status,
  },
  pricing: {
    basePricePerHour: pricing.basePricePerHour,
    duration: pricing.duration,
    subtotal: pricing.subtotal,
    serviceFee: pricing.serviceFee,
    discount: pricing.discount,
    total: pricing.total,
  },
  customerInfo: {
    name: '', // Will be filled from user data
    email: '',
    phone: '',
  },
  terms: [
    'Please arrive 10 minutes before your booking time',
    'Free cancellation up to 2 hours before the booking',
    'Changing rooms and parking available on-site',
    'Contact the venue for any questions or changes',
  ],
});

/**
 * Booking Store - Manages booking state and operations
 */
export const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  
  // New state for enhanced flow
  selectedDate: null,
  selectedTime: null,
  selectedDuration: 1,
  availableTimeSlots: [],
  pricingBreakdown: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Enhanced actions for new booking flow
  setTimeSlot: (date, time) => set({ selectedDate: date, selectedTime: time }),
  setDuration: (duration) => set({ selectedDuration: duration }),
  setAvailableTimeSlots: (slots) => set({ availableTimeSlots: slots }),
  setPricingBreakdown: (pricing) => set({ pricingBreakdown: pricing }),
  
  // Calculate dynamic pricing with first-time booking consideration
  calculateDynamicPricing: (basePricePerHour, duration, isFirstBooking = false) => {
    const pricing = calculatePricing(basePricePerHour, duration, isFirstBooking);
    set({ pricingBreakdown: pricing });
    return pricing;
  },
  
  // Validate slot availability
  validateSlotAvailability: (date, time, duration) => {
    // Mock implementation - in real app this would check against backend
    const timeSlot = parseInt(time.split(':')[0]);
    const endTime = timeSlot + duration;
    
    // Simple validation: slots from 9 AM to 9 PM, check if end time is valid
    if (timeSlot < 9 || endTime > 21) {
      return false;
    }
    
    // Check against existing bookings (mock logic)
    const existingBookings = get().bookings.filter(booking => 
      booking.date === date.toISOString().split('T')[0] &&
      booking.status === 'confirmed'
    );
    
    for (let booking of existingBookings) {
      const bookingStart = parseInt(booking.time.split(':')[0]);
      const bookingEnd = bookingStart + booking.duration;
      
      if ((timeSlot >= bookingStart && timeSlot < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (timeSlot <= bookingStart && endTime >= bookingEnd)) {
        return false;
      }
    }
    
    return true;
  },
  
  // Get contiguous available slots for duration selection
  getContiguousSlots: (selectedTime) => {
    const timeSlot = parseInt(selectedTime.split(':')[0]);
    const maxHours = Math.min(3, 21 - timeSlot); // Max 3 hours or until 9 PM
    
    const contiguousSlots = [];
    for (let i = 1; i <= maxHours; i++) {
      const endTime = timeSlot + i;
      if (endTime <= 21) {
        contiguousSlots.push(`${timeSlot}:00-${endTime}:00`);
      }
    }
    
    return contiguousSlots;
  },
  
  // Check first-time booking eligibility
  checkFirstTimeBookingEligibility: async () => {
    try {
      const userStore = useUserStore.getState();
      return userStore.checkFirstTimeBookingEligibility();
    } catch (error) {
      console.error('Error checking first-time booking eligibility:', error);
      return false;
    }
  },

  // Load bookings from storage
  loadBookings: async () => {
    try {
      set({ isLoading: true, error: null });
      const storedBookings = await SecureStore.getItemAsync('user-bookings');
      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        set({ bookings, isLoading: false });
      } else {
        // Initialize with mock data for development
        const mockBookings = get().initializeMockData();
        set({ bookings: mockBookings, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Save bookings to storage
  saveBookings: async (bookings) => {
    try {
      await SecureStore.setItemAsync('user-bookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Failed to save bookings:', error);
    }
  },

  // Create a new booking with enhanced features
  createBooking: async (bookingData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check first-time booking eligibility
      const isFirstBooking = await get().checkFirstTimeBookingEligibility();
      
      const pricing = calculatePricing(
        bookingData.basePricePerHour, 
        bookingData.duration,
        isFirstBooking
      );
      
      const booking = createBookingData({
        ...bookingData,
        totalPrice: pricing.total,
        isFirstBooking,
        pricingDetails: pricing,
      });
      
      const receipt = generateReceipt(booking, pricing);
      booking.receipt = receipt;
      
      const currentBookings = get().bookings;
      const updatedBookings = [booking, ...currentBookings];
      
      await get().saveBookings(updatedBookings);
      set({ 
        bookings: updatedBookings, 
        currentBooking: booking,
        isLoading: false 
      });
      
      // Update user booking status if this is first booking
      if (isFirstBooking) {
        const userStore = useUserStore.getState();
        await userStore.updateUserBookingStatus(booking);
      }
      
      return booking;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentBookings = get().bookings;
      const updatedBookings = currentBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, updatedAt: new Date().toISOString() }
          : booking
      );
      
      await get().saveBookings(updatedBookings);
      set({ bookings: updatedBookings, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    await get().updateBookingStatus(bookingId, 'cancelled');
  },

  // Get booking by ID
  getBookingById: (bookingId) => {
    const bookings = get().bookings;
    return bookings.find(booking => booking.id === bookingId);
  },

  // Get bookings by status
  getBookingsByStatus: (status) => {
    const bookings = get().bookings;
    return bookings.filter(booking => booking.status === status);
  },

  // Get categorized bookings
  getCategorizedBookings: () => {
    const bookings = get().bookings;
    const now = new Date();
    
    return {
      upcoming: bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return booking.status === 'confirmed' && bookingDate >= now;
      }),
      past: bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return booking.status === 'completed' || 
               (booking.status === 'confirmed' && bookingDate < now);
      }),
      cancelled: bookings.filter(booking => booking.status === 'cancelled'),
    };
  },

  // Set current booking for detailed view
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  
  // Search and filter bookings
  searchBookings: (searchTerm, filters = {}) => {
    const bookings = get().bookings;
    
    let filteredBookings = bookings;
    
    // Apply search term filter
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.pitchName.toLowerCase().includes(term) ||
        booking.location.toLowerCase().includes(term) ||
        booking.bookingRef.toLowerCase().includes(term)
      );
    }
    
    // Apply location filter
    if (filters.location && filters.location !== 'all') {
      filteredBookings = filteredBookings.filter(booking => 
        booking.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filteredBookings = filteredBookings.filter(booking => 
        filters.status.includes(booking.status)
      );
    }
    
    // Apply date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }
    
    return filteredBookings;
  },

  // Initialize mock data for development
  initializeMockData: () => {
    const mockBookings = [
      createBookingData({
        id: '1',
        pitchName: 'Greenfield Stadium',
        pitchImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
        date: '2025-09-15',
        time: '18:00',
        duration: 1,
        location: '123 Football Street, Lagos, Nigeria',
        basePricePerHour: 12500,
        totalPrice: 15000,
        status: 'confirmed',
        bookingRef: 'PL001',
        pitchType: '5-a-side',
        surface: 'Artificial Grass',
        amenities: ['Floodlit', 'Parking', 'Changing Rooms'],
        venueContact: '+234 81 1234 5678',
      }),
      createBookingData({
        id: '2',
        pitchName: 'City Sports Complex',
        pitchImage: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
        date: '2025-09-20',
        time: '15:00',
        duration: 2,
        location: '456 Sports Avenue, Lagos, Nigeria',
        basePricePerHour: 15000,
        totalPrice: 29500,
        status: 'confirmed',
        bookingRef: 'PL002',
        pitchType: '11-a-side',
        surface: 'Natural Grass',
        amenities: ['Floodlit', 'Parking'],
        venueContact: '+234 81 2345 6789',
      }),
      createBookingData({
        id: '3',
        pitchName: 'Elite Football Academy',
        pitchImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop',
        date: '2025-09-01',
        time: '19:00',
        duration: 1,
        location: '789 Academy Road, Lagos, Nigeria',
        basePricePerHour: 18750,
        totalPrice: 21250,
        status: 'completed',
        bookingRef: 'PL003',
        pitchType: '5-a-side',
        surface: 'Artificial Grass',
        amenities: ['Floodlit', 'Parking', 'Changing Rooms'],
        venueContact: '+234 81 3456 7890',
      }),
      createBookingData({
        id: '4',
        pitchName: 'Parkside Pitch',
        pitchImage: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop',
        date: '2025-08-25',
        time: '16:00',
        duration: 1,
        location: '321 Park Lane, Lagos, Nigeria',
        basePricePerHour: 12250,
        totalPrice: 14750,
        status: 'completed',
        bookingRef: 'PL004',
        pitchType: '11-a-side',
        surface: 'Natural Grass',
        amenities: ['Parking'],
        venueContact: '+234 81 4567 8901',
      }),
      createBookingData({
        id: '5',
        pitchName: 'Riverside Football Ground',
        pitchImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop',
        date: '2025-09-10',
        time: '20:00',
        duration: 1,
        location: '654 River Road, Lagos, Nigeria',
        basePricePerHour: 11250,
        totalPrice: 13750,
        status: 'cancelled',
        bookingRef: 'PL005',
        pitchType: '7-a-side',
        surface: 'Artificial Grass',
        amenities: ['Parking', 'Changing Rooms'],
        venueContact: '+234 81 5678 9012',
      }),
    ];

    // Generate receipts for all bookings
    return mockBookings.map(booking => {
      const pricing = calculatePricing(booking.basePricePerHour, booking.duration);
      booking.receipt = generateReceipt(booking, pricing);
      return booking;
    });
  },
}));

/**
 * Booking UI Store - Manages UI state for booking screens
 */
export const useBookingUIStore = create((set, get) => ({
  // State
  selectedTab: 'upcoming',
  showReceiptModal: false,
  selectedBookingForReceipt: null,
  
  // Actions
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  
  showReceipt: (booking) => set({ 
    showReceiptModal: true, 
    selectedBookingForReceipt: booking 
  }),
  
  hideReceipt: () => set({ 
    showReceiptModal: false, 
    selectedBookingForReceipt: null 
  }),
}));