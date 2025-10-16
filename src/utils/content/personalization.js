import { CONTENT_CATEGORIES } from '../types/models';

/**
 * Content Personalization Engine
 * 
 * Provides sophisticated content personalization based on user preferences,
 * favorite club, reading history, and premium subscription status.
 */

/**
 * Calculate content relevance score for personalization
 * @param {Object} article - Article object
 * @param {Object} userPreferences - User preferences from store
 * @param {boolean} isPremium - Whether user has premium subscription
 * @returns {number} Relevance score (0-100)
 */
export function calculateContentRelevance(article, userPreferences, isPremium = false) {
  let score = 0;
  const maxScore = 100;
  
  // Base score for all articles
  score += 10;
  
  // Favorite club bonus (highest priority)
  if (userPreferences.favoriteClub && article.relatedClubs.includes(userPreferences.favoriteClub.id)) {
    score += 40;
    
    // Extra bonus for club-specific premium content
    if (article.isPremium && isPremium) {
      score += 10;
    }
  }
  
  // Category preferences bonus
  if (userPreferences.contentInteractions?.recentCategories) {
    const recentCategories = userPreferences.contentInteractions.recentCategories;
    if (recentCategories.includes(article.category)) {
      score += 20;
    }
  }
  
  // Breaking news gets priority
  if (article.category === CONTENT_CATEGORIES.BREAKING_NEWS) {
    score += 15;
  }
  
  // Premier League priority for global appeal
  if (article.category === CONTENT_CATEGORIES.PREMIER_LEAGUE) {
    score += 10;
  }
  
  // Champions League priority
  if (article.category === CONTENT_CATEGORIES.CHAMPIONS_LEAGUE) {
    score += 12;
  }
  
  // Recency bonus (newer articles get higher scores)
  const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 1) {
    score += 10; // Very recent
  } else if (hoursOld < 6) {
    score += 8; // Recent
  } else if (hoursOld < 24) {
    score += 5; // Today
  } else if (hoursOld < 48) {
    score += 2; // Yesterday
  }
  
  // Engagement bonus (popular articles)
  const engagement = (article.views || 0) + (article.likes || 0) + (article.shares || 0);
  if (engagement > 20000) {
    score += 8;
  } else if (engagement > 10000) {
    score += 5;
  } else if (engagement > 5000) {
    score += 3;
  }
  
  // Premium content accessibility
  if (article.isPremium && !isPremium) {
    // Reduce score for inaccessible premium content
    score -= 15;
  } else if (article.isPremium && isPremium) {
    // Bonus for accessible premium content
    score += 15;
  }
  
  // Author bonus for known authors (based on interaction history)
  if (userPreferences.contentInteractions?.favoriteAuthors?.includes(article.author)) {
    score += 10;
  }
  
  // Competition bonus based on user preferences
  if (userPreferences.preferredCompetitions?.includes(article.competition)) {
    score += 8;
  }
  
  return Math.min(score, maxScore);
}

/**
 * Generate personalized content feed
 * @param {Array} articles - All available articles
 * @param {Object} userPreferences - User preferences
 * @param {boolean} isPremium - Premium subscription status
 * @param {number} limit - Maximum number of articles to return
 * @returns {Array} Personalized and scored articles
 */
export function generatePersonalizedFeed(articles, userPreferences, isPremium = false, limit = 20) {
  if (!articles || articles.length === 0) {
    return [];
  }
  
  // Calculate relevance scores for all articles
  const scoredArticles = articles.map(article => ({
    ...article,
    relevanceScore: calculateContentRelevance(article, userPreferences, isPremium),
    isPersonalized: true,
  }));
  
  // Sort by relevance score (highest first)
  const sortedArticles = scoredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Ensure diversity in the feed
  const diversifiedFeed = diversifyContent(sortedArticles, userPreferences);
  
  // Apply content access rules
  const accessibleFeed = diversifiedFeed.map(article => {
    if (article.isPremium && !isPremium) {
      return {
        ...article,
        content: article.premiumPreview || article.summary,
        isPreview: true,
        requiresUpgrade: true,
      };
    }
    return article;
  });
  
  return accessibleFeed.slice(0, limit);
}

/**
 * Diversify content to avoid too much repetition
 * @param {Array} articles - Scored articles
 * @param {Object} userPreferences - User preferences
 * @returns {Array} Diversified articles
 */
function diversifyContent(articles, userPreferences) {
  const diversified = [];
  const categoryCount = {};
  const clubCount = {};
  const maxPerCategory = 3;
  const maxPerClub = 4;
  
  // First pass: Add highest scored articles with diversity constraints
  for (const article of articles) {
    const category = article.category;
    const clubs = article.relatedClubs;
    
    // Check category diversity
    if ((categoryCount[category] || 0) >= maxPerCategory) {
      continue;
    }
    
    // Check club diversity (for non-favorite clubs)
    const clubOverLimit = clubs.some(club => {
      if (club === userPreferences.favoriteClub?.id) {
        return false; // Allow more content from favorite club
      }
      return (clubCount[club] || 0) >= maxPerClub;
    });
    
    if (clubOverLimit) {
      continue;
    }
    
    // Add article and update counters
    diversified.push(article);
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    clubs.forEach(club => {
      clubCount[club] = (clubCount[club] || 0) + 1;
    });
  }
  
  // Second pass: Fill remaining slots with lower-scored articles
  const remaining = articles.filter(article => !diversified.includes(article));
  diversified.push(...remaining.slice(0, Math.max(0, 20 - diversified.length)));
  
  return diversified;
}

/**
 * Get club-specific content recommendations
 * @param {Array} articles - All articles
 * @param {string} clubId - Club identifier
 * @param {boolean} isPremium - Premium status
 * @param {number} limit - Maximum articles
 * @returns {Array} Club-specific articles
 */
export function getClubSpecificContent(articles, clubId, isPremium = false, limit = 10) {
  if (!articles || !clubId) {
    return [];
  }
  
  const clubArticles = articles
    .filter(article => article.relatedClubs.includes(clubId))
    .map(article => {
      if (article.isPremium && !isPremium) {
        return {
          ...article,
          content: article.premiumPreview || article.summary,
          isPreview: true,
          requiresUpgrade: true,
        };
      }
      return article;
    })
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  return clubArticles.slice(0, limit);
}

/**
 * Get trending content based on engagement metrics
 * @param {Array} articles - All articles
 * @param {number} limit - Maximum articles
 * @param {number} hoursWindow - Time window for trending calculation
 * @returns {Array} Trending articles
 */
export function getTrendingContent(articles, limit = 10, hoursWindow = 24) {
  if (!articles) {
    return [];
  }
  
  const cutoffTime = Date.now() - (hoursWindow * 60 * 60 * 1000);
  
  const recentArticles = articles.filter(article => 
    new Date(article.publishedAt).getTime() > cutoffTime
  );
  
  // Calculate trending score based on engagement per hour
  const trendingArticles = recentArticles.map(article => {
    const hoursOld = Math.max(1, (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60));
    const engagementRate = ((article.views || 0) + (article.likes || 0) * 2 + (article.shares || 0) * 3) / hoursOld;
    
    return {
      ...article,
      trendingScore: engagementRate,
      isTrending: true,
    };
  });
  
  return trendingArticles
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}

/**
 * Get content recommendations based on reading history
 * @param {Array} articles - All articles
 * @param {Object} contentInteractions - User's content interaction history
 * @param {boolean} isPremium - Premium status
 * @param {number} limit - Maximum articles
 * @returns {Array} Recommended articles
 */
export function getRecommendedContent(articles, contentInteractions, isPremium = false, limit = 10) {
  if (!articles || !contentInteractions) {
    return [];
  }
  
  const { recentCategories, favoriteAuthors } = contentInteractions;
  
  const recommendations = articles
    .filter(article => {
      // Include articles from recently read categories
      if (recentCategories && recentCategories.includes(article.category)) {
        return true;
      }
      
      // Include articles from favorite authors
      if (favoriteAuthors && favoriteAuthors.includes(article.author)) {
        return true;
      }
      
      return false;
    })
    .map(article => {
      let recommendationScore = 0;
      
      // Score based on category interest
      if (recentCategories) {
        const categoryIndex = recentCategories.indexOf(article.category);
        if (categoryIndex !== -1) {
          recommendationScore += (recentCategories.length - categoryIndex) * 10;
        }
      }
      
      // Score based on author preference
      if (favoriteAuthors && favoriteAuthors.includes(article.author)) {
        recommendationScore += 25;
      }
      
      // Apply premium content rules
      if (article.isPremium && !isPremium) {
        return {
          ...article,
          content: article.premiumPreview || article.summary,
          isPreview: true,
          requiresUpgrade: true,
          recommendationScore,
        };
      }
      
      return {
        ...article,
        recommendationScore,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
  
  return recommendations.slice(0, limit);
}

/**
 * Apply content filters
 * @param {Array} articles - Articles to filter
 * @param {Object} filters - Filter criteria
 * @param {boolean} isPremium - Premium status for access control
 * @returns {Array} Filtered articles
 */
export function applyContentFilters(articles, filters, isPremium = false) {
  if (!articles) {
    return [];
  }
  
  let filteredArticles = [...articles];
  
  // Text search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredArticles = filteredArticles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      filters.categories.includes(article.category)
    );
  }
  
  // Club filter
  if (filters.clubs && filters.clubs.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      article.relatedClubs.some(club => filters.clubs.includes(club))
    );
  }
  
  // Competition filter
  if (filters.competitions && filters.competitions.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      filters.competitions.includes(article.competition)
    );
  }
  
  // Access level filter
  if (filters.accessLevel && filters.accessLevel !== 'all') {
    if (filters.accessLevel === 'free') {
      filteredArticles = filteredArticles.filter(article => !article.isPremium);
    } else if (filters.accessLevel === 'premium') {
      filteredArticles = filteredArticles.filter(article => article.isPremium);
      
      // Apply premium access rules
      if (!isPremium) {
        filteredArticles = filteredArticles.map(article => ({
          ...article,
          content: article.premiumPreview || article.summary,
          isPreview: true,
          requiresUpgrade: true,
        }));
      }
    }
  }
  
  // Date range filter
  if (filters.dateRange) {
    const { from, to } = filters.dateRange;
    filteredArticles = filteredArticles.filter(article => {
      const publishedDate = new Date(article.publishedAt);
      return publishedDate >= from && publishedDate <= to;
    });
  }
  
  return filteredArticles;
}

/**
 * Get personalized live match recommendations
 * @param {Array} liveMatches - All live matches
 * @param {Object} userPreferences - User preferences
 * @param {boolean} isPremium - Premium status
 * @returns {Array} Recommended live matches
 */
export function getPersonalizedLiveMatches(liveMatches, userPreferences, isPremium = false) {
  if (!liveMatches) {
    return [];
  }
  
  const personalizedMatches = liveMatches.map(match => {
    let relevanceScore = 0;
    
    // Favorite club bonus
    if (userPreferences.favoriteClub) {
      const clubId = userPreferences.favoriteClub.id;
      if (match.homeTeam.id === clubId || match.awayTeam.id === clubId) {
        relevanceScore += 50;
      }
    }
    
    // Competition preferences
    if (userPreferences.preferredCompetitions?.includes(match.competition)) {
      relevanceScore += 20;
    }
    
    // Live matches get priority
    if (match.status === 'live') {
      relevanceScore += 30;
    }
    
    // Upcoming matches
    if (match.status === 'scheduled') {
      relevanceScore += 15;
    }
    
    // Premium stream availability
    if (match.hasLiveStream) {
      if (match.requiresPremium && isPremium) {
        relevanceScore += 25;
      } else if (!match.requiresPremium) {
        relevanceScore += 15;
      }
    }
    
    return {
      ...match,
      relevanceScore,
      canWatch: match.hasLiveStream && (!match.requiresPremium || isPremium),
      requiresUpgrade: match.hasLiveStream && match.requiresPremium && !isPremium,
    };
  });
  
  return personalizedMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Update user preferences based on content interactions
 * @param {Object} currentPreferences - Current user preferences
 * @param {string} articleId - Article that was interacted with
 * @param {Object} article - Article data
 * @param {string} interactionType - Type of interaction (view, like, share)
 * @returns {Object} Updated preferences
 */
export function updatePreferencesFromInteraction(currentPreferences, articleId, article, interactionType) {
  const updatedPreferences = { ...currentPreferences };
  
  if (!updatedPreferences.contentInteractions) {
    updatedPreferences.contentInteractions = {
      articlesRead: 0,
      streamingMinutes: 0,
      lastActiveDate: new Date(),
      recentCategories: [],
      premiumContentAccessed: 0,
      favoriteAuthors: [],
    };
  }
  
  const interactions = updatedPreferences.contentInteractions;
  
  // Update interaction counts
  if (interactionType === 'view') {
    interactions.articlesRead += 1;
    if (article.isPremium) {
      interactions.premiumContentAccessed += 1;
    }
  }
  
  // Update recent categories
  if (!interactions.recentCategories.includes(article.category)) {
    interactions.recentCategories.unshift(article.category);
    interactions.recentCategories = interactions.recentCategories.slice(0, 10); // Keep last 10
  }
  
  // Update favorite authors based on interaction frequency
  if (interactionType === 'like' || interactionType === 'share') {
    if (!interactions.favoriteAuthors) {
      interactions.favoriteAuthors = [];
    }
    
    if (!interactions.favoriteAuthors.includes(article.author)) {
      interactions.favoriteAuthors.push(article.author);
    }
  }
  
  // Update preferred competitions
  if (article.competition && !updatedPreferences.preferredCompetitions?.includes(article.competition)) {
    if (!updatedPreferences.preferredCompetitions) {
      updatedPreferences.preferredCompetitions = [];
    }
    updatedPreferences.preferredCompetitions.push(article.competition);
  }
  
  interactions.lastActiveDate = new Date();
  
  return updatedPreferences;
}

export default {
  calculateContentRelevance,
  generatePersonalizedFeed,
  getClubSpecificContent,
  getTrendingContent,
  getRecommendedContent,
  applyContentFilters,
  getPersonalizedLiveMatches,
  updatePreferencesFromInteraction,
};