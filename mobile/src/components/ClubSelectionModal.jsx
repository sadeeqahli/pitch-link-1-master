import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Search, 
  Check, 
  Users,
  Star,
  MapPin,
  Trophy,
  Heart,
  Zap,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useUserPreferencesStore } from '../utils/subscription/store';

/**
 * ClubSelectionModal Component
 * 
 * A comprehensive modal for users to search and select their favorite football club
 * for content personalization. Includes search functionality, popular clubs,
 * and persistence of user preferences.
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onClubSelected - Function called when club is selected
 * @param {boolean} props.isFirstTime - Whether this is first-time club selection
 * @param {string} props.title - Custom modal title
 */
export default function ClubSelectionModal({ 
  visible, 
  onClose, 
  onClubSelected, 
  isFirstTime = false,
  title = null 
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const searchInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    favoriteClub,
    setFavoriteClub,
  } = useUserPreferencesStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Sample football clubs data (in a real app, this would come from an API)
  const popularClubs = [
    {
      id: 'arsenal',
      name: 'Arsenal',
      league: 'Premier League',
      country: 'England',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
      popularity: 95,
      isVerified: true,
    },
    {
      id: 'chelsea',
      name: 'Chelsea',
      league: 'Premier League', 
      country: 'England',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
      popularity: 94,
      isVerified: true,
    },
    {
      id: 'manchester-united',
      name: 'Manchester United',
      league: 'Premier League',
      country: 'England', 
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
      popularity: 98,
      isVerified: true,
    },
    {
      id: 'liverpool',
      name: 'Liverpool',
      league: 'Premier League',
      country: 'England',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
      popularity: 97,
      isVerified: true,
    },
    {
      id: 'manchester-city',
      name: 'Manchester City',
      league: 'Premier League',
      country: 'England',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
      popularity: 92,
      isVerified: true,
    },
    {
      id: 'real-madrid',
      name: 'Real Madrid',
      league: 'La Liga',
      country: 'Spain',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
      popularity: 99,
      isVerified: true,
    },
    {
      id: 'barcelona',
      name: 'FC Barcelona',
      league: 'La Liga',
      country: 'Spain',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
      popularity: 98,
      isVerified: true,
    },
    {
      id: 'bayern-munich',
      name: 'Bayern Munich',
      league: 'Bundesliga',
      country: 'Germany',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
      popularity: 93,
      isVerified: true,
    },
    {
      id: 'juventus',
      name: 'Juventus',
      league: 'Serie A',
      country: 'Italy',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png',
      popularity: 91,
      isVerified: true,
    },
    {
      id: 'psg',
      name: 'Paris Saint-Germain',
      league: 'Ligue 1',
      country: 'France',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png',
      popularity: 90,
      isVerified: true,
    },
  ];

  useEffect(() => {
    if (visible && isFirstTime) {
      // Auto-focus search input for better UX
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 500);
    }
  }, [visible, isFirstTime]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    setIsLoading(true);

    try {
      // Simulate API search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter popular clubs based on search query
      const filtered = popularClubs.filter(club =>
        club.name.toLowerCase().includes(query.toLowerCase()) ||
        club.league.toLowerCase().includes(query.toLowerCase()) ||
        club.country.toLowerCase().includes(query.toLowerCase())
      );
      
      // Sort by popularity
      const sortedResults = filtered.sort((a, b) => b.popularity - a.popularity);
      
      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to search clubs. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleClubSelect = (club) => {
    setSelectedClub(club);
  };

  const handleConfirmSelection = async () => {
    if (!selectedClub) return;
    
    setIsLoading(true);
    
    try {
      const success = await setFavoriteClub(selectedClub);
      
      if (success) {
        onClubSelected?.(selectedClub);
        onClose();
        
        Alert.alert(
          'Club Selected!',
          `You've selected ${selectedClub.name} as your favorite club. Your content feed will now be personalized with ${selectedClub.name} news and updates.`,
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'Selection Failed',
          'Failed to save your club selection. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to select club:', error);
      Alert.alert(
        'Error',
        'An error occurred while saving your selection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedClub(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  const getDisplayTitle = () => {
    if (title) return title;
    if (isFirstTime) return 'Choose Your Favorite Club';
    return 'Change Favorite Club';
  };

  const getDisplaySubtitle = () => {
    if (isFirstTime) {
      return 'Get personalized news and content for your favorite team';
    }
    return 'Select a different club to personalize your content';
  };

  const ClubCard = ({ club, isSelected, onSelect }) => (
    <TouchableOpacity
      onPress={() => onSelect(club)}
      style={{
        backgroundColor: isSelected 
          ? '#00FF8820' 
          : isDark ? '#1E1E1E' : '#FFFFFF',
        borderWidth: 2,
        borderColor: isSelected ? '#00FF88' : isDark ? '#333333' : '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark ? '#333333' : '#F3F4F6',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: club.logoUrl }}
          style={{ width: 48, height: 48 }}
          contentFit="contain"
        />
      </View>
      
      <View style={{ flex: 1, marginLeft: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Inter_600SemiBold',
              color: isDark ? '#FFFFFF' : '#000000',
              flex: 1,
            }}
          >
            {club.name}
          </Text>
          {club.isVerified && (
            <View
              style={{
                backgroundColor: '#00FF88',
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginLeft: 8,
              }}
            >
              <Check size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Trophy size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_500Medium',
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginLeft: 4,
              marginRight: 12,
            }}
          >
            {club.league}
          </Text>
          
          <MapPin size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_400Regular',
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginLeft: 4,
            }}
          >
            {club.country}
          </Text>
        </View>
      </View>
      
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? '#00FF88' : isDark ? '#666666' : '#D1D5DB',
          backgroundColor: isSelected ? '#00FF88' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isSelected && <Check size={14} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );

  const clubsToShow = searchQuery.length > 2 ? searchResults : popularClubs;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} style={{ flex: 1 }}>
        <View style={{ 
          flex: 1, 
          backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA',
        }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 60,
              paddingBottom: 20,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: 'Inter_700Bold',
                  color: isDark ? '#FFFFFF' : '#000000',
                }}
              >
                {getDisplayTitle()}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter_400Regular',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginTop: 4,
                }}
              >
                {getDisplaySubtitle()}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
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
              }}
            >
              <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for your club..."
                placeholderTextColor={isDark ? '#666666' : '#9CA3AF'}
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: 'Inter_400Regular',
                  color: isDark ? '#FFFFFF' : '#000000',
                }}
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#00FF88" />
              )}
            </View>
          </View>

          {/* Current Selection Display */}
          {selectedClub && (
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <View
                style={{
                  backgroundColor: '#00FF8815',
                  borderWidth: 1,
                  borderColor: '#00FF88',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Heart size={20} color="#00FF88" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter_600SemiBold',
                    color: '#00FF88',
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  Selected: {selectedClub.name}
                </Text>
                <TouchableOpacity
                  onPress={clearSelection}
                  style={{
                    padding: 4,
                  }}
                >
                  <X size={16} color="#00FF88" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Clubs List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: 20, 
              paddingBottom: selectedClub ? 120 : 40 
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Section Title */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Inter_600SemiBold',
                  color: isDark ? '#FFFFFF' : '#000000',
                  marginBottom: 4,
                }}
              >
                {searchQuery.length > 2 ? 'Search Results' : 'Popular Clubs'}
              </Text>
              {searchQuery.length <= 2 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Star size={14} color="#00FF88" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter_400Regular',
                      color: isDark ? '#9CA3AF' : '#6B7280',
                      marginLeft: 4,
                    }}
                  >
                    Most followed clubs worldwide
                  </Text>
                </View>
              )}
            </View>

            {/* Clubs Grid */}
            {clubsToShow.length > 0 ? (
              clubsToShow.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  isSelected={selectedClub?.id === club.id}
                  onSelect={handleClubSelect}
                />
              ))
            ) : searchQuery.length > 2 ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 40,
                }}
              >
                <Users size={48} color={isDark ? '#666666' : '#9CA3AF'} />
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Inter_600SemiBold',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginTop: 16,
                    textAlign: 'center',
                  }}
                >
                  No clubs found
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter_400Regular',
                    color: isDark ? '#666666' : '#9CA3AF',
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  Try searching with a different term
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Confirm Button */}
          {selectedClub && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 20,
                paddingBottom: 40,
                paddingTop: 20,
                backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA',
                borderTopWidth: 1,
                borderTopColor: isDark ? '#333333' : '#E5E7EB',
              }}
            >
              <TouchableOpacity
                onPress={handleConfirmSelection}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#666666' : '#00FF88',
                  borderRadius: 16,
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#00FF88',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Zap size={20} color="#FFFFFF" />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontSize: 18,
                        fontFamily: 'Inter_600SemiBold',
                        color: '#FFFFFF',
                      }}
                    >
                      Confirm Selection
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter_400Regular',
                  color: isDark ? '#666666' : '#9CA3AF',
                  textAlign: 'center',
                  marginTop: 12,
                }}
              >
                You can change this anytime in your profile settings
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </Modal>
  );
}