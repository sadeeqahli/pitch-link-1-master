import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Crown, 
  Play, 
  Lock, 
  Check, 
  Star,
  Zap,
  Users,
  TrendingUp,
  Shield,
  CreditCard,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useSubscriptionStore } from '../utils/subscription/store';

const { width: screenWidth } = Dimensions.get('window');

/**
 * PaywallModal Component
 * 
 * A comprehensive subscription modal with dynamic pricing, first-time user discounts,
 * and compelling premium feature presentation.
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSubscribe - Function to handle subscription (receives plan type)
 * @param {string} props.trigger - What triggered the paywall ('content', 'live_stream', 'general')
 * @param {string} props.contentTitle - Title of locked content (if applicable)
 */
export default function PaywallModal({ 
  visible, 
  onClose, 
  onSubscribe, 
  trigger = 'general',
  contentTitle = null 
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    getApplicablePricing,
    calculatePrice,
    isProcessingPayment,
    paymentError,
    clearPaymentError,
  } = useSubscriptionStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const pricing = getApplicablePricing();
  const monthlyPrice = calculatePrice('monthly');
  const yearlyPrice = calculatePrice('yearly');

  // Clear payment error when modal opens
  useEffect(() => {
    if (visible) {
      clearPaymentError();
    }
  }, [visible]);

  if (!fontsLoaded) {
    return null;
  }

  const formatPrice = (amount) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  const handleSubscribe = async () => {
    if (isProcessingPayment) return;
    
    setIsLoading(true);
    
    try {
      await onSubscribe(selectedPlan);
    } catch (error) {
      Alert.alert(
        'Subscription Error',
        error.message || 'Failed to process subscription. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (trigger) {
      case 'live_stream':
        return 'Watch Live Matches';
      case 'content':
        return 'Read Premium Content';
      default:
        return 'Upgrade to Premium';
    }
  };

  const getModalSubtitle = () => {
    switch (trigger) {
      case 'live_stream':
        return 'Get instant access to live football streaming';
      case 'content':
        return contentTitle ? `Unlock "${contentTitle}" and thousands more premium articles` : 'Access exclusive football content';
      default:
        return 'Unlock premium features and exclusive content';
    }
  };

  const premiumFeatures = [
    {
      icon: Play,
      title: 'Live Match Streaming',
      description: 'Watch live football matches in HD quality',
      highlight: trigger === 'live_stream',
    },
    {
      icon: Lock,
      title: 'Premium Content',
      description: 'Exclusive articles, analysis, and insider news',
      highlight: trigger === 'content',
    },
    {
      icon: Users,
      title: 'Personalized Feed',
      description: 'Content tailored to your favorite club',
      highlight: false,
    },
    {
      icon: TrendingUp,
      title: 'Advanced Statistics',
      description: 'In-depth match stats and player analytics',
      highlight: false,
    },
    {
      icon: Shield,
      title: 'Ad-Free Experience',
      description: 'Enjoy content without interruptions',
      highlight: false,
    },
    {
      icon: Star,
      title: 'Early Access',
      description: 'Be first to read breaking news',
      highlight: false,
    },
  ];

  const PlanCard = ({ plan, price, isSelected, onSelect, savings = null, badge = null }) => (
    <TouchableOpacity
      onPress={() => onSelect(plan)}
      style={{
        backgroundColor: isSelected 
          ? '#00FF8820' 
          : isDark ? '#1E1E1E' : '#FFFFFF',
        borderWidth: 2,
        borderColor: isSelected ? '#00FF88' : isDark ? '#333333' : '#E5E7EB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        position: 'relative',
      }}
    >
      {badge && (
        <View
          style={{
            position: 'absolute',
            top: -8,
            left: 20,
            backgroundColor: '#FF6B00',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Zap size={12} color="#FFFFFF" />
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Inter_600SemiBold',
              color: '#FFFFFF',
              marginLeft: 4,
            }}
          >
            {badge}
          </Text>
        </View>
      )}
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Inter_600SemiBold',
              color: isDark ? '#FFFFFF' : '#000000',
              marginBottom: 4,
            }}
          >
            {plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
          </Text>
          
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'Inter_700Bold',
              color: '#00FF88',
            }}
          >
            {formatPrice(price.amount)}
          </Text>
          
          {plan === 'yearly' && (
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_400Regular',
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginTop: 2,
              }}
            >
              {formatPrice(price.monthlyEquivalent)} per month
            </Text>
          )}
          
          {savings && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_500Medium',
                color: '#00FF88',
                marginTop: 4,
              }}
            >
              Save {formatPrice(savings)}
            </Text>
          )}
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
      </View>
    </TouchableOpacity>
  );

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
                {getModalTitle()}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter_400Regular',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginTop: 4,
                }}
              >
                {getModalSubtitle()}
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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* First-time Discount Banner */}
            {pricing.isFirstTimeDiscount && (
              <View
                style={{
                  backgroundColor: '#FF6B0015',
                  borderWidth: 1,
                  borderColor: '#FF6B00',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Crown size={24} color="#FF6B00" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Inter_600SemiBold',
                      color: '#FF6B00',
                      marginBottom: 2,
                    }}
                  >
                    First-Time Discount!
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter_400Regular',
                      color: isDark ? '#9CA3AF' : '#6B7280',
                    }}
                  >
                    Save {pricing.discountPercentage}% on your first subscription
                  </Text>
                </View>
              </View>
            )}

            {/* Pricing Plans */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Inter_600SemiBold',
                  color: isDark ? '#FFFFFF' : '#000000',
                  marginBottom: 16,
                }}
              >
                Choose Your Plan
              </Text>

              <PlanCard
                plan="monthly"
                price={monthlyPrice}
                isSelected={selectedPlan === 'monthly'}
                onSelect={setSelectedPlan}
                savings={monthlyPrice.savings > 0 ? monthlyPrice.savings : null}
                badge={pricing.isFirstTimeDiscount ? 'FIRST TIME OFFER' : null}
              />

              <PlanCard
                plan="yearly"
                price={yearlyPrice}
                isSelected={selectedPlan === 'yearly'}
                onSelect={setSelectedPlan}
                savings={yearlyPrice.savings}
                badge="BEST VALUE"
              />
            </View>

            {/* Premium Features */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Inter_600SemiBold',
                  color: isDark ? '#FFFFFF' : '#000000',
                  marginBottom: 16,
                }}
              >
                What You Get
              </Text>

              {premiumFeatures.map((feature, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: feature.highlight 
                      ? '#00FF8810' 
                      : isDark ? '#1E1E1E' : '#FFFFFF',
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: feature.highlight ? 1 : 0,
                    borderColor: feature.highlight ? '#00FF88' : 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: feature.highlight 
                        ? '#00FF8820' 
                        : isDark ? '#333333' : '#F3F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <feature.icon 
                      size={20} 
                      color={feature.highlight ? '#00FF88' : isDark ? '#9CA3AF' : '#6B7280'} 
                    />
                  </View>
                  
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Inter_600SemiBold',
                        color: isDark ? '#FFFFFF' : '#000000',
                        marginBottom: 2,
                      }}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter_400Regular',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}
                    >
                      {feature.description}
                    </Text>
                  </View>
                  
                  {feature.highlight && (
                    <Star size={16} color="#00FF88" style={{ marginLeft: 8 }} />
                  )}
                </View>
              ))}
            </View>

            {/* Error Message */}
            {paymentError && (
              <View
                style={{
                  backgroundColor: '#FEE2E2',
                  borderWidth: 1,
                  borderColor: '#FCA5A5',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter_500Medium',
                    color: '#DC2626',
                    textAlign: 'center',
                  }}
                >
                  {paymentError}
                </Text>
              </View>
            )}

            {/* Trust Indicators */}
            <View
              style={{
                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="#00FF88" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter_500Medium',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginLeft: 8,
                  }}
                >
                  Secure payment powered by Stripe
                </Text>
              </View>
              
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter_400Regular',
                  color: isDark ? '#666666' : '#9CA3AF',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                Cancel anytime • No hidden fees • 30-day money-back guarantee
              </Text>
            </View>
          </ScrollView>

          {/* Subscribe Button */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 40,
              paddingTop: 20,
              backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA',
              borderTopWidth: 1,
              borderTopColor: isDark ? '#333333' : '#E5E7EB',
            }}
          >
            <TouchableOpacity
              onPress={handleSubscribe}
              disabled={isLoading || isProcessingPayment}
              style={{
                backgroundColor: (isLoading || isProcessingPayment) ? '#666666' : '#00FF88',
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
              {(isLoading || isProcessingPayment) ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CreditCard size={20} color="#FFFFFF" />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 18,
                      fontFamily: 'Inter_600SemiBold',
                      color: '#FFFFFF',
                    }}
                  >
                    Subscribe {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}
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
              {selectedPlan === 'monthly' 
                ? `You'll be charged ${formatPrice(selectedPlan === 'monthly' ? monthlyPrice.amount : yearlyPrice.amount)} today and monthly thereafter`
                : `You'll be charged ${formatPrice(yearlyPrice.amount)} today for a full year`
              }
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}