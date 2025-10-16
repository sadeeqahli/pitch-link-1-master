import { create } from 'zustand';
import { 
  ACCESS_LEVEL, 
  CONTENT_CATEGORIES, 
  MATCH_STATUS 
} from '../types/models';

/**
 * ContentStore
 * Manages news articles, live matches, and content access control
 * with premium subscription integration and personalization
 */
export const useContentStore = create((set, get) => ({
  // Content state
  articles: [],
  liveMatches: [],
  featuredArticles: [],
  personalizedFeed: [],
  
  // Loading states
  isLoadingArticles: false,
  isLoadingMatches: false,
  isRefreshing: false,
  
  // Error states
  articlesError: null,
  matchesError: null,
  
  // Pagination
  articlesPage: 1,
  hasMoreArticles: true,
  articlesPerPage: 10,
  
  // Filters
  activeFilters: {
    categories: [],
    clubs: [],
    competitions: [],
    accessLevel: 'all', // 'all', 'free', 'premium'
    dateRange: null,
    searchQuery: '',
  },
  
  /**
   * Initialize content store with mock data
   */
  initialize: async () => {
    const { loadArticles, loadLiveMatches } = get();
    
    set({ 
      isLoadingArticles: true, 
      isLoadingMatches: true,
      articlesError: null,
      matchesError: null 
    });
    
    try {
      await Promise.all([
        loadArticles(true),
        loadLiveMatches(),
      ]);
    } catch (error) {
      console.error('Failed to initialize content store:', error);
    }
  },
  
  /**
   * Load articles with optional filtering
   */
  loadArticles: async (reset = false, filters = null) => {
    const currentState = get();
    const appliedFilters = filters || currentState.activeFilters;
    
    if (reset) {
      set({ 
        isLoadingArticles: true,
        articlesPage: 1,
        articlesError: null 
      });
    } else {
      set({ isLoadingArticles: true });
    }
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockArticles = generateMockArticles(
        reset ? 1 : currentState.articlesPage,
        currentState.articlesPerPage,
        appliedFilters
      );
      
      const newArticles = reset 
        ? mockArticles 
        : [...currentState.articles, ...mockArticles];
      
      set({
        articles: newArticles,
        isLoadingArticles: false,
        articlesPage: reset ? 2 : currentState.articlesPage + 1,
        hasMoreArticles: mockArticles.length === currentState.articlesPerPage,
        articlesError: null,
      });
      
      // Update featured articles
      const featured = newArticles
        .filter(article => article.category === CONTENT_CATEGORIES.BREAKING_NEWS || 
                          article.category === CONTENT_CATEGORIES.TRANSFER_NEWS)
        .slice(0, 5);
      
      set({ featuredArticles: featured });
      
      return newArticles;
    } catch (error) {
      console.error('Failed to load articles:', error);
      set({ 
        isLoadingArticles: false,
        articlesError: 'Failed to load articles. Please try again.'
      });
      throw error;
    }
  },
  
  /**
   * Load live matches
   */
  loadLiveMatches: async () => {
    set({ isLoadingMatches: true, matchesError: null });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockMatches = generateMockLiveMatches();
      
      set({
        liveMatches: mockMatches,
        isLoadingMatches: false,
        matchesError: null,
      });
      
      return mockMatches;
    } catch (error) {
      console.error('Failed to load live matches:', error);
      set({ 
        isLoadingMatches: false,
        matchesError: 'Failed to load live matches. Please try again.'
      });
      throw error;
    }
  },
  
  /**
   * Apply content filters
   */
  applyFilters: async (filters) => {
    set({ activeFilters: { ...get().activeFilters, ...filters } });
    await get().loadArticles(true, get().activeFilters);
  },
  
  /**
   * Clear all filters
   */
  clearFilters: async () => {
    const defaultFilters = {
      categories: [],
      clubs: [],
      competitions: [],
      accessLevel: 'all',
      dateRange: null,
      searchQuery: '',
    };
    
    set({ activeFilters: defaultFilters });
    await get().loadArticles(true, defaultFilters);
  },
  
  /**
   * Search articles
   */
  searchArticles: async (query) => {
    const filters = { ...get().activeFilters, searchQuery: query };
    await get().applyFilters(filters);
  },
  
  /**
   * Get personalized content based on user preferences
   */
  generatePersonalizedFeed: (userPreferences, isPremium = false) => {
    const { articles } = get();
    
    if (!userPreferences || !userPreferences.favoriteClub) {
      return articles.slice(0, 10);
    }
    
    const { favoriteClub, contentInteractions } = userPreferences;
    
    // Filter articles based on user preferences
    let personalizedArticles = articles.filter(article => {
      // Include articles related to favorite club
      if (article.relatedClubs.includes(favoriteClub.id)) {
        return true;
      }
      
      // Include articles from preferred categories
      if (contentInteractions.recentCategories && 
          contentInteractions.recentCategories.includes(article.category)) {
        return true;
      }
      
      // Include breaking news
      if (article.category === CONTENT_CATEGORIES.BREAKING_NEWS) {
        return true;
      }
      
      return false;
    });
    
    // If premium, prioritize premium content
    if (isPremium) {
      personalizedArticles = [
        ...personalizedArticles.filter(article => article.isPremium),
        ...personalizedArticles.filter(article => !article.isPremium),
      ];
    } else {
      // For free users, filter out premium content or show previews
      personalizedArticles = personalizedArticles.map(article => {
        if (article.isPremium) {
          return {
            ...article,
            content: article.premiumPreview || article.summary,
            isPreview: true,
          };
        }
        return article;
      });
    }
    
    // Sort by relevance and recency
    personalizedArticles.sort((a, b) => {
      // Club-related articles get highest priority
      const aClubRelated = a.relatedClubs.includes(favoriteClub.id);
      const bClubRelated = b.relatedClubs.includes(favoriteClub.id);
      
      if (aClubRelated && !bClubRelated) return -1;
      if (!aClubRelated && bClubRelated) return 1;
      
      // Then by publication date
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
    
    const personalizedFeed = personalizedArticles.slice(0, 15);
    set({ personalizedFeed });
    
    return personalizedFeed;
  },
  
  /**
   * Check if user can access content
   */
  canAccessContent: (article, isPremium = false) => {
    if (!article.isPremium) {
      return { canAccess: true, reason: null };
    }
    
    if (isPremium) {
      return { canAccess: true, reason: null };
    }
    
    return { 
      canAccess: false, 
      reason: 'premium_required',
      message: 'This content requires a premium subscription to access.'
    };
  },
  
  /**
   * Get content preview for premium articles
   */
  getContentPreview: (article, isPremium = false) => {
    if (!article.isPremium || isPremium) {
      return {
        content: article.content,
        isFullContent: true,
        showPaywall: false,
      };
    }
    
    return {
      content: article.premiumPreview || article.summary,
      isFullContent: false,
      showPaywall: true,
      upgradeMessage: `Continue reading this ${article.category.toLowerCase()} article with premium access.`,
    };
  },
  
  /**
   * Track content interaction
   */
  trackContentInteraction: (articleId, interactionType = 'view') => {
    const { articles } = get();
    
    // Update article view count (mock)
    const updatedArticles = articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          views: (article.views || 0) + (interactionType === 'view' ? 1 : 0),
          shares: (article.shares || 0) + (interactionType === 'share' ? 1 : 0),
          likes: (article.likes || 0) + (interactionType === 'like' ? 1 : 0),
        };
      }
      return article;
    });
    
    set({ articles: updatedArticles });
  },
  
  /**
   * Refresh all content
   */
  refreshContent: async () => {
    set({ isRefreshing: true });
    
    try {
      await Promise.all([
        get().loadArticles(true),
        get().loadLiveMatches(),
      ]);
    } catch (error) {
      console.error('Failed to refresh content:', error);
    } finally {
      set({ isRefreshing: false });
    }
  },
  
  /**
   * Load more articles (pagination)
   */
  loadMoreArticles: async () => {
    const { hasMoreArticles, isLoadingArticles } = get();
    
    if (!hasMoreArticles || isLoadingArticles) {
      return;
    }
    
    await get().loadArticles(false);
  },
  
  /**
   * Get filtered live matches
   */
  getFilteredLiveMatches: (requiresPremium = null) => {
    const { liveMatches } = get();
    
    if (requiresPremium === null) {
      return liveMatches;
    }
    
    return liveMatches.filter(match => match.requiresPremium === requiresPremium);
  },
  
  /**
   * Get articles by category
   */
  getArticlesByCategory: (category, limit = null) => {
    const { articles } = get();
    const filtered = articles.filter(article => article.category === category);
    
    return limit ? filtered.slice(0, limit) : filtered;
  },
  
  /**
   * Get trending articles
   */
  getTrendingArticles: (limit = 5) => {
    const { articles } = get();
    
    return articles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  },
}));

/**
 * Generate mock articles for testing
 */
function generateMockArticles(page = 1, perPage = 10, filters = {}) {
  const mockArticles = [
    {
      id: 'article-1',
      title: 'Transfer Roundup: Premier League\'s Biggest Summer Moves',
      summary: 'A comprehensive look at the most significant transfers that shaped the Premier League this summer.',
      content: 'Full article content about Premier League transfers...',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      category: CONTENT_CATEGORIES.TRANSFER_NEWS,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      readTime: 5,
      author: 'James Mitchell',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isPremium: false,
      accessLevel: ACCESS_LEVEL.FREE,
      relatedClubs: ['arsenal', 'chelsea', 'manchester-united'],
      tags: ['transfers', 'premier-league', 'summer-window'],
      competition: 'Premier League',
      views: 15420,
      shares: 284,
      likes: 1205,
    },
    {
      id: 'article-2',
      title: 'Champions League Quarter-Finals: Tactical Analysis',
      summary: 'Breaking down the tactical battles that will define the Champions League quarter-finals.',
      content: 'Detailed tactical analysis of Champions League matches...',
      premiumPreview: 'This premium analysis includes exclusive tactical insights, heat maps, and expert commentary from our football analysts.',
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      category: CONTENT_CATEGORIES.CHAMPIONS_LEAGUE,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      readTime: 8,
      author: 'Maria Santos',
      authorImage: 'https://images.unsplash.com/photo-1494790108755-2616b64e29c0?w=150&h=150&fit=crop&crop=face',
      isPremium: true,
      accessLevel: ACCESS_LEVEL.PREMIUM,
      relatedClubs: ['real-madrid', 'barcelona', 'bayern-munich'],
      tags: ['champions-league', 'tactics', 'analysis'],
      competition: 'Champions League',
      views: 8934,
      shares: 156,
      likes: 892,
    },
    {
      id: 'article-3',
      title: 'Arsenal\'s Title Challenge: Can They Maintain Momentum?',
      summary: 'Analyzing Arsenal\'s chances of winning the Premier League title this season.',
      content: 'In-depth analysis of Arsenal\'s title prospects...',
      premiumPreview: 'Our exclusive analysis includes player performance metrics, injury reports, and fixture difficulty analysis.',
      imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop',
      category: CONTENT_CATEGORIES.PREMIER_LEAGUE,
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      readTime: 6,
      author: 'David Thompson',
      authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isPremium: true,
      accessLevel: ACCESS_LEVEL.PREMIUM,
      relatedClubs: ['arsenal'],
      tags: ['arsenal', 'premier-league', 'title-race'],
      competition: 'Premier League',
      views: 12367,
      shares: 421,
      likes: 1567,
    },
    {
      id: 'article-4',
      title: 'Women\'s World Cup: England\'s Road to Glory',
      summary: 'Following the Lionesses\' journey through the Women\'s World Cup.',
      content: 'Complete coverage of England women\'s national team...',
      imageUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop',
      category: CONTENT_CATEGORIES.WOMENS_FOOTBALL,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      readTime: 4,
      author: 'Sarah Williams',
      authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isPremium: false,
      accessLevel: ACCESS_LEVEL.FREE,
      relatedClubs: [],
      tags: ['womens-football', 'world-cup', 'england'],
      competition: 'Women\'s World Cup',
      views: 7892,
      shares: 198,
      likes: 654,
    },
    {
      id: 'article-5',
      title: 'BREAKING: Manchester City Signs Record Deal',
      summary: 'Manchester City announces their biggest signing in club history.',
      content: 'Breaking news about Manchester City\'s latest acquisition...',
      premiumPreview: 'Get exclusive details about the transfer fee, contract terms, and player background.',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop',
      category: CONTENT_CATEGORIES.BREAKING_NEWS,
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      readTime: 3,
      author: 'Alex Rodriguez',
      authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isPremium: true,
      accessLevel: ACCESS_LEVEL.PREMIUM,
      relatedClubs: ['manchester-city'],
      tags: ['breaking-news', 'transfers', 'manchester-city'],
      competition: 'Premier League',
      views: 23156,
      shares: 892,
      likes: 3421,
    },
  ];
  
  // Apply filters
  let filteredArticles = mockArticles;
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredArticles = filteredArticles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  if (filters.categories && filters.categories.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      filters.categories.includes(article.category)
    );
  }
  
  if (filters.clubs && filters.clubs.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      article.relatedClubs.some(club => filters.clubs.includes(club))
    );
  }
  
  if (filters.accessLevel && filters.accessLevel !== 'all') {
    if (filters.accessLevel === 'free') {
      filteredArticles = filteredArticles.filter(article => !article.isPremium);
    } else if (filters.accessLevel === 'premium') {
      filteredArticles = filteredArticles.filter(article => article.isPremium);
    }
  }
  
  // Simulate pagination
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return filteredArticles.slice(start, end);
}

/**
 * Generate mock live matches for testing
 */
function generateMockLiveMatches() {
  return [
    {
      id: 'match-1',
      homeTeam: {
        id: 'arsenal',
        name: 'Arsenal',
        shortName: 'ARS',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
        colors: '#DC143C',
      },
      awayTeam: {
        id: 'chelsea',
        name: 'Chelsea',
        shortName: 'CHE',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
        colors: '#034694',
      },
      competition: 'Premier League',
      matchDate: new Date(),
      status: MATCH_STATUS.LIVE,
      score: { home: 2, away: 1, minute: '78\'', period: 'Second Half' },
      venue: 'Emirates Stadium',
      hasLiveStream: true,
      streamUrl: 'https://stream.example.com/match1',
      requiresPremium: true,
      availableQualities: [
        { id: '720p', label: '720p HD', bitrate: 3000, resolution: '1280x720', isDefault: true },
        { id: '1080p', label: '1080p Full HD', bitrate: 6000, resolution: '1920x1080', isDefault: false },
      ],
      commentary: 'English',
      attendance: 59867,
    },
    {
      id: 'match-2',
      homeTeam: {
        id: 'manchester-united',
        name: 'Manchester United',
        shortName: 'MUN',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
        colors: '#DA020E',
      },
      awayTeam: {
        id: 'liverpool',
        name: 'Liverpool',
        shortName: 'LIV',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
        colors: '#C8102E',
      },
      competition: 'Premier League',
      matchDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: MATCH_STATUS.SCHEDULED,
      score: { home: null, away: null },
      venue: 'Old Trafford',
      hasLiveStream: true,
      streamUrl: 'https://stream.example.com/match2',
      requiresPremium: false,
      availableQualities: [
        { id: '720p', label: '720p HD', bitrate: 3000, resolution: '1280x720', isDefault: true },
      ],
      commentary: 'English',
      attendance: null,
    },
    {
      id: 'match-3',
      homeTeam: {
        id: 'real-madrid',
        name: 'Real Madrid',
        shortName: 'RMA',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
        colors: '#FFFFFF',
      },
      awayTeam: {
        id: 'barcelona',
        name: 'FC Barcelona',
        shortName: 'BAR',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
        colors: '#A50044',
      },
      competition: 'La Liga',
      matchDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: MATCH_STATUS.FINISHED,
      score: { home: 2, away: 3, minute: 'FT', period: 'Full Time' },
      venue: 'Santiago Bernabéu',
      hasLiveStream: false,
      streamUrl: null,
      requiresPremium: true,
      availableQualities: [],
      commentary: 'Spanish',
      attendance: 81044,
    },
  ];
}

export default useContentStore;