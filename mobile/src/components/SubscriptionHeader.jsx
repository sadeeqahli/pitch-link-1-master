import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { 
  Crown, 
  Zap, 
  Star,
  Clock,
  ChevronRight,
  Gift,
  AlertTriangle,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useSubscriptionStore } from '../utils/subscription/store';

/**
 * SubscriptionHeader Component
 * 
 * A smart header component that displays subscription status and provides
 * upgrade options. Shows different states based on subscription status.
 * 
 * @param {Object} props
 * @param {Function} props.onUpgradePress - Function called when upgrade button is pressed
 * @param {boolean} props.showUpgradeButton - Whether to show the upgrade button
 * @param {string} props.variant - Header variant ('compact', 'expanded', 'banner')
 * @param {Object} props.style - Additional styling
 */
export default function SubscriptionHeader({ 
  onUpgradePress,
  showUpgradeButton = true,
  variant = 'expanded',
  style = {} 
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const {
    isPremium,
    getSubscriptionSummary,
    isEligibleForFirstTimeDiscount,
    getApplicablePricing,
  } = useSubscriptionStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const subscriptionSummary = getSubscriptionSummary();
  const pricing = getApplicablePricing();
  const isFirstTimeDiscount = isEligibleForFirstTimeDiscount();

  const formatPrice = (amount) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Compact variant for minimal space usage
  if (variant === 'compact') {
    return (
      <View style={[
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {isPremium ? (
            <Crown size={20} color="#00FF88" />
          ) : (
            <Star size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          )}
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_600SemiBold',
              color: isDark ? '#FFFFFF' : '#000000',
              marginLeft: 8,
            }}
          >
            {subscriptionSummary.displayStatus}
          </Text>
        </View>
        
        {showUpgradeButton && subscriptionSummary.showUpgrade && (
          <TouchableOpacity
            onPress={onUpgradePress}
            style={{
              backgroundColor: '#00FF88',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_600SemiBold',
                color: '#FFFFFF',
              }}
            >
              Upgrade
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Banner variant for prominent display
  if (variant === 'banner') {
    if (isPremium && !subscriptionSummary.isExpiringSoon && !subscriptionSummary.isExpired) {
      return null; // Don't show banner for active premium users
    }

    const getBannerConfig = () => {
      if (subscriptionSummary.isExpired) {
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#FCA5A5',
          iconColor: '#DC2626',
          textColor: '#DC2626',
          icon: AlertTriangle,
          title: 'Subscription Expired',
          message: 'Renew your premium subscription to continue enjoying exclusive content',
          buttonText: 'Renew Now',
          buttonColor: '#DC2626',
        };
      }
      
      if (subscriptionSummary.isExpiringSoon) {
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#FCD34D',
          iconColor: '#F59E0B',
          textColor: '#92400E',
          icon: Clock,
          title: 'Subscription Expiring Soon',
          message: subscriptionSummary.message,
          buttonText: 'Manage',
          buttonColor: '#F59E0B',
        };
      }

      // Free user banner
      return {
        backgroundColor: '#DBEAFE',
        borderColor: '#93C5FD',
        iconColor: '#2563EB',
        textColor: '#1E40AF',
        icon: isFirstTimeDiscount ? Gift : Zap,
        title: isFirstTimeDiscount ? 'Special Offer!' : 'Upgrade to Premium',
        message: isFirstTimeDiscount 
          ? `Get ${pricing.discountPercentage}% off your first month - Only ${formatPrice(pricing.firstTimeMonthly)}`
          : 'Access live streaming, premium content, and personalized news',
        buttonText: isFirstTimeDiscount ? 'Claim Offer' : 'Upgrade',
        buttonColor: '#2563EB',
      };
    };

    const bannerConfig = getBannerConfig();

    return (
      <View style={[
        {
          backgroundColor: bannerConfig.backgroundColor,
          borderWidth: 1,
          borderColor: bannerConfig.borderColor,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        },
        style
      ]}>
        <bannerConfig.icon size={24} color={bannerConfig.iconColor} />
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: bannerConfig.textColor,
              marginBottom: 2,
            }}
          >
            {bannerConfig.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_400Regular',
              color: bannerConfig.textColor,
              opacity: 0.8,
            }}
          >
            {bannerConfig.message}
          </Text>
        </View>
        
        {showUpgradeButton && (
          <TouchableOpacity
            onPress={onUpgradePress}
            style={{
              backgroundColor: bannerConfig.buttonColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_600SemiBold',
                color: '#FFFFFF',
              }}
            >
              {bannerConfig.buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Expanded variant (default) for detailed status display
  return (
    <View style={[
      {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      style
    ]}>
      {/* Header Row */}
      <View 
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {isPremium ? (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#00FF8820',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Crown size={20} color="#00FF88" />
            </View>
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#333333' : '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Star size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </View>
          )}
          
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_600SemiBold',
                color: isDark ? '#FFFFFF' : '#000000',
                marginBottom: 2,
              }}
            >
              {subscriptionSummary.displayStatus}
            </Text>
            
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_400Regular',
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              {subscriptionSummary.message}
            </Text>
          </View>
        </View>
        
        {showUpgradeButton && subscriptionSummary.showUpgrade && (
          <TouchableOpacity
            onPress={onUpgradePress}
            style={{
              backgroundColor: '#00FF88',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_600SemiBold',
                color: '#FFFFFF',
                marginRight: 4,
              }}
            >
              {isPremium ? 'Manage' : 'Upgrade'}
            </Text>
            <ChevronRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Additional Information */}
      {isPremium && subscriptionSummary.nextBillingDate && (
        <View
          style={{
            backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA',
            borderRadius: 12,
            padding: 12,
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_500Medium',
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginLeft: 8,
              }}
            >
              {subscriptionSummary.isExpiringSoon 
                ? `Expires ${formatDate(subscriptionSummary.nextBillingDate)}`
                : `Next billing: ${formatDate(subscriptionSummary.nextBillingDate)}`
              }
            </Text>
          </View>
        </View>
      )}

      {/* First-time discount notice for free users */}
      {!isPremium && isFirstTimeDiscount && (
        <View
          style={{
            backgroundColor: '#FF6B0015',
            borderWidth: 1,
            borderColor: '#FF6B00',
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Gift size={16} color="#FF6B00" />
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_500Medium',
              color: '#FF6B00',
              marginLeft: 8,
              flex: 1,
            }}
          >
            First-time offer: Save {pricing.discountPercentage}% on your first subscription!
          </Text>
        </View>
      )}

      {/* Premium Features Preview for Free Users */}
      {!isPremium && (
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: isDark ? '#FFFFFF' : '#000000',
              marginBottom: 12,
            }}
          >
            Premium Benefits
          </Text>
          
          <View style={{ gap: 8 }}>
            {[
              'Live match streaming in HD',
              'Unlimited premium articles',
              'Personalized content feed',
              'Ad-free experience',
            ].map((benefit, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Star size={14} color="#00FF88" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter_400Regular',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginLeft: 8,
                  }}
                >
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}