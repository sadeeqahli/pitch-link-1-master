import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { 
  Search, 
  Filter, 
  X, 
  Crown,
  ChevronDown,
  Check,
  Calendar,
  Users,
  Trophy,
  Tag,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useContentStore } from '../utils/content/store';
import { useSubscriptionStore } from '../utils/subscription/store';
import { useUserPreferencesStore } from '../utils/subscription/store';
import { CONTENT_CATEGORIES } from '../utils/types/models';

/**
 * EnhancedSearch Component
 * 
 * A comprehensive search component with premium content filtering,
 * advanced filters, and personalized search suggestions.
 * 
 * @param {Object} props
 * @param {Function} props.onSearchResults - Callback with search results
 * @param {Function} props.onArticleSelect - Callback when article is selected
 * @param {string} props.placeholder - Search input placeholder
 * @param {boolean} props.autoFocus - Whether to auto-focus the search input
 */
export default function EnhancedSearch({ 
  onSearchResults, 
  onArticleSelect,
  placeholder = "Search news, clubs, competitions...",
  autoFocus = false 
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const searchInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    accessLevel: 'all', // 'all', 'free', 'premium'
    dateRange: 'all', // 'all', 'today', 'week', 'month'
    sortBy: 'relevance', // 'relevance', 'newest', 'popular'
  });

  const {
    searchArticles,
    applyFilters,
    articles,
  } = useContentStore();

  const { isPremium } = useSubscriptionStore();
  const { favoriteClub } = useUserPreferencesStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Search suggestions based on user context
  const searchSuggestions = [
    ...(favoriteClub ? [`${favoriteClub.name} news`, `${favoriteClub.name} transfers`] : []),
    'Breaking news',
    'Transfer news',
    'Champions League',
    'Premier League',
    'Match highlights',
    'Live scores',
    ...(isPremium ? ['Premium analysis', 'Exclusive interviews'] : []),
  ];

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowSuggestions(searchQuery.length === 0);
    }
  }, [searchQuery, activeFilters]);

  const performSearch = async () => {
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      // Build comprehensive filters
      const searchFilters = {
        searchQuery,
        categories: activeFilters.categories,
        accessLevel: activeFilters.accessLevel,
        dateRange: getDateRangeFilter(activeFilters.dateRange),
      };
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter articles based on search criteria
      let results = articles.filter(article => {
        // Text search
        const searchTerms = searchQuery.toLowerCase().split(' ');
        const searchableText = `${article.title} ${article.summary} ${article.author} ${article.tags.join(' ')}`.toLowerCase();
        
        const matchesSearch = searchTerms.every(term => searchableText.includes(term));
        if (!matchesSearch) return false;
        
        // Category filter
        if (searchFilters.categories.length > 0 && !searchFilters.categories.includes(article.category)) {
          return false;
        }
        
        // Access level filter
        if (searchFilters.accessLevel === 'free' && article.isPremium) {
          return false;
        }
        if (searchFilters.accessLevel === 'premium' && !article.isPremium) {
          return false;
        }
        
        // Date filter
        if (searchFilters.dateRange) {
          const articleDate = new Date(article.publishedAt);
          const now = new Date();
          const diffHours = (now - articleDate) / (1000 * 60 * 60);
          
          if (searchFilters.dateRange === 'today' && diffHours > 24) return false;
          if (searchFilters.dateRange === 'week' && diffHours > 168) return false;
          if (searchFilters.dateRange === 'month' && diffHours > 720) return false;
        }
        
        return true;
      });
      
      // Apply sorting
      results = sortSearchResults(results, activeFilters.sortBy, searchQuery);
      
      // Add premium access information
      results = results.map(article => ({
        ...article,
        canAccess: !article.isPremium || isPremium,
        requiresUpgrade: article.isPremium && !isPremium,
      }));
      
      setSearchResults(results);
      onSearchResults?.(results);
      
      // Add to recent searches
      if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const sortSearchResults = (results, sortBy, query) => {
    switch (sortBy) {
      case 'newest':
        return results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      
      case 'popular':
        return results.sort((a, b) => (b.views || 0) - (a.views || 0));
      
      case 'relevance':
      default:
        // Calculate relevance score
        return results.map(article => ({
          ...article,
          relevanceScore: calculateSearchRelevance(article, query),
        })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  };

  const calculateSearchRelevance = (article, query) => {
    const queryTerms = query.toLowerCase().split(' ');
    let score = 0;
    
    // Title matches get highest score
    queryTerms.forEach(term => {
      if (article.title.toLowerCase().includes(term)) {
        score += 10;
      }
      if (article.summary.toLowerCase().includes(term)) {
        score += 5;
      }
      if (article.tags.some(tag => tag.toLowerCase().includes(term))) {
        score += 3;
      }
    });
    
    // Favorite club bonus
    if (favoriteClub && article.relatedClubs.includes(favoriteClub.id)) {
      score += 5;
    }
    
    // Recency bonus
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 24) score += 3;
    
    return score;
  };

  const getDateRangeFilter = (range) => {
    switch (range) {
      case 'today': return 'today';
      case 'week': return 'week';
      case 'month': return 'month';
      default: return null;
    }
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleCategoryToggle = (category) => {
    setActiveFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      categories: [],
      accessLevel: 'all',
      dateRange: 'all',
      sortBy: 'relevance',
    });
  };

  const hasActiveFilters = () => {
    return activeFilters.categories.length > 0 ||
           activeFilters.accessLevel !== 'all' ||
           activeFilters.dateRange !== 'all' ||
           activeFilters.sortBy !== 'relevance';
  };

  if (!fontsLoaded) {
    return null;
  }

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA',
        paddingTop: 60,
      }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#333333' : '#E5E7EB',
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'Inter_700Bold',
              color: isDark ? '#FFFFFF' : '#000000',
            }}
          >
            Search Filters
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <X size={16} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Categories */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_600SemiBold',
                color: isDark ? '#FFFFFF' : '#000000',
                marginBottom: 12,
              }}
            >
              Categories
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Object.values(CONTENT_CATEGORIES).map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryToggle(category)}
                  style={{
                    backgroundColor: activeFilters.categories.includes(category)
                      ? '#00FF88'
                      : isDark ? '#1E1E1E' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: activeFilters.categories.includes(category)
                      ? '#00FF88'
                      : isDark ? '#333333' : '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {activeFilters.categories.includes(category) && (
                    <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter_500Medium',
                      color: activeFilters.categories.includes(category)
                        ? '#FFFFFF'
                        : isDark ? '#FFFFFF' : '#000000',
                    }}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Access Level */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_600SemiBold',
                color: isDark ? '#FFFFFF' : '#000000',
                marginBottom: 12,
              }}
            >
              Content Access
            </Text>
            
            {['all', 'free', 'premium'].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => handleFilterChange('accessLevel', level)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: activeFilters.accessLevel === level
                    ? '#00FF8820'
                    : 'transparent',
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: activeFilters.accessLevel === level ? '#00FF88' : isDark ? '#666666' : '#D1D5DB',
                    backgroundColor: activeFilters.accessLevel === level ? '#00FF88' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  {activeFilters.accessLevel === level && (
                    <Check size={12} color="#FFFFFF" />
                  )}
                </View>
                
                {level === 'premium' && <Crown size={16} color="#00FF88" style={{ marginRight: 8 }} />}
                
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter_500Medium',
                    color: isDark ? '#FFFFFF' : '#000000',
                    textTransform: 'capitalize',
                  }}
                >
                  {level === 'all' ? 'All Content' : `${level} Content`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Range */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_600SemiBold',
                color: isDark ? '#FFFFFF' : '#000000',
                marginBottom: 12,
              }}
            >
              Published
            </Text>
            
            {[
              { value: 'all', label: 'Any time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Past week' },
              { value: 'month', label: 'Past month' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleFilterChange('dateRange', option.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: activeFilters.dateRange === option.value
                    ? '#00FF8820'
                    : 'transparent',
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: activeFilters.dateRange === option.value ? '#00FF88' : isDark ? '#666666' : '#D1D5DB',
                    backgroundColor: activeFilters.dateRange === option.value ? '#00FF88' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  {activeFilters.dateRange === option.value && (
                    <Check size={12} color="#FFFFFF" />
                  )}
                </View>
                
                <Calendar size={16} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 8 }} />
                
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter_500Medium',
                    color: isDark ? '#FFFFFF' : '#000000',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_600SemiBold',
                color: isDark ? '#FFFFFF' : '#000000',
                marginBottom: 12,
              }}
            >
              Sort By
            </Text>
            
            {[
              { value: 'relevance', label: 'Relevance', icon: Search },
              { value: 'newest', label: 'Newest first', icon: Calendar },
              { value: 'popular', label: 'Most popular', icon: Trophy },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleFilterChange('sortBy', option.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: activeFilters.sortBy === option.value
                    ? '#00FF8820'
                    : 'transparent',
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: activeFilters.sortBy === option.value ? '#00FF88' : isDark ? '#666666' : '#D1D5DB',
                    backgroundColor: activeFilters.sortBy === option.value ? '#00FF88' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  {activeFilters.sortBy === option.value && (
                    <Check size={12} color="#FFFFFF" />
                  )}
                </View>
                
                <option.icon size={16} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 8 }} />
                
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter_500Medium',
                    color: isDark ? '#FFFFFF' : '#000000',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            flexDirection: 'row',
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333333' : '#E5E7EB',
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={clearFilters}
            style={{
              flex: 1,
              backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
                color: isDark ? '#FFFFFF' : '#000000',
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={{
              flex: 2,
              backgroundColor: '#00FF88',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
                color: '#FFFFFF',
              }}
            >
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View>
      {/* Search Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: isDark ? '#333333' : '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        
        <TextInput
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#666666' : '#9CA3AF'}
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: isDark ? '#FFFFFF' : '#000000',
          }}
          onFocus={() => setShowSuggestions(searchQuery.length === 0)}
          returnKeyType="search"
        />
        
        {isSearching && (
          <ActivityIndicator size="small" color="#00FF88" style={{ marginLeft: 8 }} />
        )}
        
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            marginLeft: 12,
            padding: 4,
            backgroundColor: hasActiveFilters() ? '#00FF8820' : 'transparent',
            borderRadius: 8,
          }}
        >
          <Filter 
            size={20} 
            color={hasActiveFilters() ? '#00FF88' : (isDark ? '#9CA3AF' : '#6B7280')} 
          />
        </TouchableOpacity>
      </View>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {activeFilters.categories.map((category) => (
            <View
              key={category}
              style={{
                backgroundColor: '#00FF8820',
                borderWidth: 1,
                borderColor: '#00FF88',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter_500Medium',
                  color: '#00FF88',
                  marginRight: 4,
                }}
              >
                {category}
              </Text>
              <TouchableOpacity onPress={() => handleCategoryToggle(category)}>
                <X size={12} color="#00FF88" />
              </TouchableOpacity>
            </View>
          ))}
          
          {activeFilters.accessLevel !== 'all' && (
            <View
              style={{
                backgroundColor: '#00FF8820',
                borderWidth: 1,
                borderColor: '#00FF88',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {activeFilters.accessLevel === 'premium' && (
                <Crown size={12} color="#00FF88" style={{ marginRight: 4 }} />
              )}
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter_500Medium',
                  color: '#00FF88',
                  marginRight: 4,
                  textTransform: 'capitalize',
                }}
              >
                {activeFilters.accessLevel}
              </Text>
              <TouchableOpacity onPress={() => handleFilterChange('accessLevel', 'all')}>
                <X size={12} color="#00FF88" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Search Suggestions */}
      {showSuggestions && searchQuery.length === 0 && (
        <View
          style={{
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 12,
            marginTop: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#333333' : '#E5E7EB',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_600SemiBold',
              color: isDark ? '#FFFFFF' : '#000000',
              marginBottom: 12,
            }}
          >
            Suggestions
          </Text>
          
          {searchSuggestions.slice(0, 6).map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSearchQuery(suggestion);
                setShowSuggestions(false);
              }}
              style={{
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Search size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: 'Inter_400Regular',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}
              >
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FilterModal />
    </View>
  );
}