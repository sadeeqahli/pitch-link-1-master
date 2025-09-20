/**
 * Data Models and Types for Premium Features
 */

// Subscription Status Types
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
};

// Access Level Types
export const ACCESS_LEVEL = {
  FREE: 'free',
  PREMIUM: 'premium',
};

// Default Pricing Configuration
export const DEFAULT_PRICING = {
  monthly: {
    amount: 450, // ₦450 per month
    currency: 'NGN',
    interval: 'month',
    firstTimeDiscount: {
      amount: 370, // ₦370 for first-time users
      percentage: 18, // 18% discount
    },
  },
  features: [
    'Unlimited premium articles',
    'Live match streaming',
    'Personalized content feed',
    'Ad-free experience',
    'Exclusive interviews',
    'Advanced match analytics',
  ],
};

// User Profile Model
export const createUserProfile = (data = {}) => ({
  id: data.id || null,
  email: data.email || null,
  name: data.name || null,
  avatar: data.avatar || null,
  preferences: {
    favoriteClubs: data.preferences?.favoriteClubs || [],
    favoriteLeagues: data.preferences?.favoriteLeagues || [],
    contentLanguage: data.preferences?.contentLanguage || 'en',
    notificationsEnabled: data.preferences?.notificationsEnabled ?? true,
  },
  subscription: {
    tier: data.subscription?.tier || ACCESS_LEVEL.FREE,
    status: data.subscription?.status || SUBSCRIPTION_STATUS.INACTIVE,
    currentPeriodEnd: data.subscription?.currentPeriodEnd || null,
  },
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// Subscription Model
export const createSubscription = (data = {}) => ({
  id: data.id || null,
  userId: data.userId || null,
  status: data.status || SUBSCRIPTION_STATUS.INACTIVE,
  tier: data.tier || ACCESS_LEVEL.FREE,
  amount: data.amount || DEFAULT_PRICING.monthly.amount,
  currency: data.currency || DEFAULT_PRICING.monthly.currency,
  interval: data.interval || DEFAULT_PRICING.monthly.interval,
  currentPeriodStart: data.currentPeriodStart || new Date().toISOString(),
  currentPeriodEnd: data.currentPeriodEnd || null,
  trialEnd: data.trialEnd || null,
  cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
  stripeCustomerId: data.stripeCustomerId || null,
  stripeSubscriptionId: data.stripeSubscriptionId || null,
  paymentMethodId: data.paymentMethodId || null,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// News Article Model
export const createArticle = (data = {}) => ({
  id: data.id || null,
  title: data.title || '',
  summary: data.summary || '',
  content: data.content || '',
  image: data.image || null,
  category: data.category || 'General',
  tags: data.tags || [],
  isPremium: data.isPremium || false,
  readTime: data.readTime || '5 min read',
  publishedAt: data.publishedAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
  author: {
    name: data.author?.name || 'Editorial Team',
    avatar: data.author?.avatar || null,
  },
  engagement: {
    views: data.engagement?.views || 0,
    likes: data.engagement?.likes || 0,
    shares: data.engagement?.shares || 0,
  },
});

// Live Match Model
export const createLiveMatch = (data = {}) => ({
  id: data.id || null,
  homeTeam: data.homeTeam || '',
  awayTeam: data.awayTeam || '',
  homeScore: data.homeScore || 0,
  awayScore: data.awayScore || 0,
  status: data.status || 'scheduled',
  competition: data.competition || '',
  venue: data.venue || '',
  kickoffTime: data.kickoffTime || new Date().toISOString(),
  streamUrl: data.streamUrl || null,
  isLive: data.isLive || false,
  isPremium: data.isPremium || true,
  matchweek: data.matchweek || null,
  season: data.season || new Date().getFullYear(),
});

// Payment Intent Model
export const createPaymentIntent = (data = {}) => ({
  id: data.id || null,
  amount: data.amount || 0,
  currency: data.currency || 'NGN',
  status: data.status || 'requires_payment_method',
  clientSecret: data.clientSecret || null,
  customerId: data.customerId || null,
  subscriptionId: data.subscriptionId || null,
  metadata: data.metadata || {},
  createdAt: data.createdAt || new Date().toISOString(),
});

// Club Model for User Preferences
export const createClub = (data = {}) => ({
  id: data.id || null,
  name: data.name || '',
  logo: data.logo || null,
  league: data.league || '',
  country: data.country || '',
  isFollowing: data.isFollowing || false,
});

// Content Filters
export const CONTENT_CATEGORIES = [
  'Transfer News',
  'Match Analysis',
  'Player Interviews',
  'League Updates',
  'Champions League',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Youth Football',
  'Women\'s Football',
];

export const CONTENT_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  LIVE_STREAM: 'live_stream',
  PODCAST: 'podcast',
  ANALYSIS: 'analysis',
};

// Search and Filter Options
export const SEARCH_FILTERS = {
  TIME_RANGE: {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    ALL: 'all',
  },
  CONTENT_TYPE: {
    ALL: 'all',
    FREE: 'free',
    PREMIUM: 'premium',
  },
  SORT_BY: {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    MOST_POPULAR: 'most_popular',
    RELEVANCE: 'relevance',
  },
};