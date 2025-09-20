import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Lock,
  Settings,
  Users,
  Clock,
  Wifi,
  Crown,
  ChevronLeft,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useSubscriptionStore } from '../utils/subscription/store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * LiveStreamPlayer Component
 * 
 * A comprehensive live streaming player with premium access control,
 * quality selection, and interactive features for football match streaming.
 * 
 * @param {Object} props
 * @param {Object} props.match - Match data object
 * @param {boolean} props.visible - Whether the player is visible
 * @param {Function} props.onClose - Function to close the player
 * @param {Function} props.onUpgradePress - Function called when upgrade is needed
 * @param {boolean} props.autoPlay - Whether to auto-play when loaded
 */
export default function LiveStreamPlayer({ 
  match, 
  visible, 
  onClose, 
  onUpgradePress,
  autoPlay = true 
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState('720p');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [viewerCount, setViewerCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const controlsTimeoutRef = useRef(null);
  
  const {
    isPremium,
    getSubscriptionSummary,
  } = useSubscriptionStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock stream qualities
  const availableQualities = [
    { id: '480p', label: '480p', bitrate: 1500 },
    { id: '720p', label: '720p HD', bitrate: 3000 },
    { id: '1080p', label: '1080p Full HD', bitrate: 6000 },
  ];

  useEffect(() => {
    if (visible && match) {
      initializeStream();
    }
  }, [visible, match]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (showControls && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const initializeStream = async () => {
    setIsLoading(true);
    setHasError(false);
    setConnectionStatus('connecting');
    
    try {
      // Simulate stream initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (match.requiresPremium && !isPremium) {
        // Stream requires premium but user is not premium
        setHasError(true);
        setConnectionStatus('premium_required');
      } else {
        // Mock successful connection
        setConnectionStatus('connected');
        setViewerCount(Math.floor(Math.random() * 50000) + 10000);
        
        if (autoPlay) {
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Stream initialization failed:', error);
      setHasError(true);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!isPremium && match.requiresPremium) {
      onUpgradePress?.();
      return;
    }
    
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    setShowControls(true);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(true);
  };

  const handleQualityChange = (quality) => {
    if (!isPremium && quality === '1080p') {
      Alert.alert(
        'Premium Required',
        '1080p streaming is available for premium subscribers only.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: onUpgradePress },
        ]
      );
      return;
    }
    
    setCurrentQuality(quality);
    setShowControls(true);
  };

  const handlePlayerTouch = () => {
    setShowControls(!showControls);
  };

  const formatViewerCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!fontsLoaded || !visible) {
    return null;
  }

  // Premium Required Overlay
  const PremiumRequiredOverlay = () => (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
          maxWidth: 320,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#00FF8820',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Crown size={32} color="#00FF88" />
        </View>
        
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Inter_700Bold',
            color: isDark ? '#FFFFFF' : '#000000',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Premium Stream
        </Text>
        
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: isDark ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 22,
          }}
        >
          This live match requires a premium subscription to watch. Upgrade now to enjoy HD streaming and exclusive content.
        </Text>
        
        <TouchableOpacity
          onPress={onUpgradePress}
          style={{
            backgroundColor: '#00FF88',
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: '#FFFFFF',
            }}
          >
            Upgrade to Premium
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onClose}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_500Medium',
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            Back to News
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Player Controls
  const PlayerControls = () => (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: showControls ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
        justifyContent: 'space-between',
        padding: 16,
      }}
    >
      {/* Top Controls */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            {match.homeTeam.name} vs {match.awayTeam.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Inter_400Regular',
              color: '#FFFFFF',
              opacity: 0.8,
            }}
          >
            {match.competition} • Live
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_500Medium',
                color: '#FFFFFF',
              }}
            >
              {currentQuality}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Play Button */}
      <TouchableOpacity
        onPress={handlePlayPause}
        style={{
          alignSelf: 'center',
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(0, 255, 136, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : isPlaying ? (
          <Pause size={24} color="#FFFFFF" />
        ) : (
          <Play size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Bottom Controls */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleMuteToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            {isMuted ? (
              <VolumeX size={20} color="#FFFFFF" />
            ) : (
              <Volume2 size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Users size={12} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_500Medium',
                color: '#FFFFFF',
                marginLeft: 4,
              }}
            >
              {formatViewerCount(viewerCount)}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: connectionStatus === 'connected' ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 107, 0, 0.8)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Wifi size={12} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_500Medium',
                color: '#FFFFFF',
                marginLeft: 4,
              }}
            >
              {connectionStatus === 'connected' ? 'HD' : 'Connecting...'}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleFullscreenToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? (
              <Minimize size={20} color="#FFFFFF" />
            ) : (
              <Maximize size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 1000,
      }}
    >
      <StatusBar hidden={isFullscreen} />
      
      {/* Video Player Background */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePlayerTouch}
        style={{
          flex: 1,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Mock Video Feed */}
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1a1a1a',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Team Logos as Mock Video Content */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ alignItems: 'center', marginRight: 40 }}>
              <Image
                source={{ uri: match.homeTeam.logoUrl }}
                style={{ width: 60, height: 60, marginBottom: 8 }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter_600SemiBold',
                  color: '#FFFFFF',
                }}
              >
                {match.homeTeam.name}
              </Text>
            </View>
            
            <View
              style={{
                backgroundColor: '#00FF88',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Inter_700Bold',
                  color: '#FFFFFF',
                }}
              >
                {match.score.home} - {match.score.away}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', marginLeft: 40 }}>
              <Image
                source={{ uri: match.awayTeam.logoUrl }}
                style={{ width: 60, height: 60, marginBottom: 8 }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter_600SemiBold',
                  color: '#FFFFFF',
                }}
              >
                {match.awayTeam.name}
              </Text>
            </View>
          </View>
          
          <View
            style={{
              backgroundColor: 'rgba(255, 107, 0, 0.8)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Clock size={14} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_600SemiBold',
                color: '#FFFFFF',
                marginLeft: 4,
              }}
            >
              {match.status} • Live
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Show controls overlay */}
      {showControls && <PlayerControls />}
      
      {/* Premium required overlay */}
      {connectionStatus === 'premium_required' && <PremiumRequiredOverlay />}
      
      {/* Loading overlay */}
      {isLoading && connectionStatus !== 'premium_required' && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#00FF88" />
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_500Medium',
              color: '#FFFFFF',
              marginTop: 16,
            }}
          >
            Loading stream...
          </Text>
        </View>
      )}
    </View>
  );
}