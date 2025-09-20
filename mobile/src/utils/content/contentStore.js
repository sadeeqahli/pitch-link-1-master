import { create } from 'zustand';

/**
 * Content Store - Manages news articles and live streaming content
 */
export const useContentStore = create((set, get) => ({
  // Content state
  articles: [],
  liveMatches: [],
  liveScores: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  // Load all content
  loadContent: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Mock content data - in production this would come from API
      const mockArticles = [
        {
          id: 1,
          title: "Transfer Window: Top 10 Moves That Shaped Football",
          summary: "A comprehensive look at the most significant transfers this season and their impact on the game.",
          image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
          publishedAt: "2 hours ago",
          category: "Transfer News",
          readTime: "5 min read",
          isPremium: false,
          content: "Full article content here...",
        },
        {
          id: 2,
          title: "Champions League Quarter-Finals: Preview and Predictions",
          summary: "Breaking down the upcoming quarter-final matches and what to expect from Europe's elite clubs.",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
          publishedAt: "4 hours ago",
          category: "Champions League",
          readTime: "7 min read",
          isPremium: true,
          content: "Exclusive premium content...",
        },
        {
          id: 3,
          title: "Youth Academy Success Stories: Rising Stars to Watch",
          summary: "Meet the young talents making waves in professional football and their journey from academy to first team.",
          image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop",
          publishedAt: "6 hours ago",
          category: "Youth Football",
          readTime: "4 min read",
          isPremium: false,
          content: "Full article content here...",
        },
        {
          id: 4,
          title: "Exclusive: Inside Training with Premier League Champions",
          summary: "Get behind-the-scenes access to training sessions and tactical preparations.",
          image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop",
          publishedAt: "8 hours ago",
          category: "Premium Exclusive",
          readTime: "10 min read",
          isPremium: true,
          content: "Premium exclusive content...",
        },
      ];
      
      const mockLiveMatches = [
        {
          id: 1,
          homeTeam: "Manchester City",
          awayTeam: "Arsenal",
          homeScore: 2,
          awayScore: 1,
          status: "LIVE",
          competition: "Premier League",
          streamUrl: "https://example.com/stream1",
          isLive: true,
        },
        {
          id: 2,
          homeTeam: "Barcelona",
          awayTeam: "Real Madrid",
          homeScore: 1,
          awayScore: 0,
          status: "LIVE",
          competition: "La Liga",
          streamUrl: "https://example.com/stream2",
          isLive: true,
        },
      ];
      
      const mockLiveScores = [
        {
          id: 1,
          homeTeam: "Arsenal",
          awayTeam: "Chelsea",
          homeScore: 2,
          awayScore: 1,
          status: "85'",
          isLive: true,
          competition: "Premier League",
        },
        {
          id: 2,
          homeTeam: "Manchester United",
          awayTeam: "Liverpool",
          homeScore: 0,
          awayScore: 3,
          status: "FT",
          isLive: false,
          competition: "Premier League",
        },
        {
          id: 3,
          homeTeam: "Real Madrid",
          awayTeam: "Barcelona",
          homeScore: null,
          awayScore: null,
          status: "19:30",
          isLive: false,
          competition: "La Liga",
        },
      ];
      
      set({
        articles: mockArticles,
        liveMatches: mockLiveMatches,
        liveScores: mockLiveScores,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      });
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Get free content only
  getFreeContent: () => {
    const { articles, liveScores } = get();
    return {
      articles: articles.filter(article => !article.isPremium),
      liveScores,
    };
  },
  
  // Get premium content only
  getPremiumContent: () => {
    const { articles } = get();
    return articles.filter(article => article.isPremium);
  },
  
  // Get personalized content for premium users
  getPersonalizedContent: () => {
    const { articles, liveMatches, liveScores } = get();
    return {
      articles,
      liveMatches,
      liveScores,
    };
  },
  
  // Clear content
  clearContent: () => {
    set({
      articles: [],
      liveMatches: [],
      liveScores: [],
      error: null,
      lastUpdated: null,
    });
  },
}));