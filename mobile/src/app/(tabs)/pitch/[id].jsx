import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Share,
  Heart,
  Clock,
  Wifi,
  Car,
  Shirt,
  Users,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Timer,
  Tag,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { calculatePricing } from "@/utils/booking/store";
import { useUserStore } from "@/utils/auth/userStore";

const { width: screenWidth } = Dimensions.get("window");

export default function PitchDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scrollViewRef = useRef(null);

  // All hooks must be called before any conditional returns
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1); // Default to 1 hour
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // Get user booking status
  const { checkFirstTimeBookingEligibility, initializeUserProfile } = useUserStore();
  
  // Memoize the initialization function
  const initializeUser = useCallback(async () => {
    await initializeUserProfile();
    const isFirstTime = checkFirstTimeBookingEligibility();
    setIsFirstTimeUser(isFirstTime);
  }, [initializeUserProfile, checkFirstTimeBookingEligibility]);
  
  // Initialize user profile and check first-time status
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Memoize time slots generation
  const generateTimeSlots = useCallback(() => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      const isAvailable = Math.random() > 0.3; // Mock availability
      
      // Check if this slot can accommodate the selected duration
      const canAccommodateDuration = hour + selectedDuration <= 21;
      
      slots.push({
        time: timeString,
        hour: hour,
        available: isAvailable && canAccommodateDuration,
        canExtend: canAccommodateDuration,
      });
    }
    return slots;
  }, [selectedDuration]);
  
  // Update available time slots when duration changes
  useEffect(() => {
    const newTimeSlots = generateTimeSlots();
    setAvailableTimeSlots(newTimeSlots);
  }, [generateTimeSlots]);

  // Early return after all hooks are called
  if (!fontsLoaded) {
    return null;
  }

  // Mock data - in a real app this would come from an API
  const pitchData = {
    1: {
      name: "Greenfield Stadium",
      images: [
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
      ],
      rating: 4.8,
      reviews: 124,
      location: "123 Football Street, London SW1A 1AA",
      distance: "0.5 km",
      price: "₦12,500/hour",
      basePricePerHour: 12500,
      type: "5-a-side",
      surface: "Artificial Grass",
      description:
        "Premium 5-a-side football pitch with floodlights and changing facilities. Perfect for evening games with friends or competitive matches. Recently renovated with high-quality artificial grass surface.",
      amenities: [
        {
          name: "Floodlit",
          icon: Clock,
          description: "LED floodlights for evening games",
        },
        {
          name: "Parking",
          icon: Car,
          description: "Free on-site parking for 20 cars",
        },
        {
          name: "Changing Rooms",
          icon: Shirt,
          description: "Clean changing rooms with lockers",
        },
        {
          name: "Capacity",
          icon: Users,
          description: "Up to 12 players (5v5 + subs)",
        },
      ],
      owner: {
        name: "Sports Center London",
        phone: "+44 20 1234 5678",
        rating: 4.9,
      },
    },
  };

  const pitch = pitchData[id] || pitchData[1];
  
  // Calculate dynamic pricing based on selected duration and first-time status
  const pricing = calculatePricing(pitch.basePricePerHour, selectedDuration, isFirstTimeUser);
  
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Generate next 7 days for calendar
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        dayName: date.toLocaleDateString("en", { weekday: "short" }),
        dayNumber: date.getDate(),
        available: i < 5, // Mock availability
      });
    }
    return dates;
  };
  
  // Get contiguous slots for duration selection
  const getContiguousSlots = (startTime) => {
    if (!startTime) return [];
    
    const startHour = parseInt(startTime.split(':')[0]);
    const maxDuration = Math.min(3, 21 - startHour); // Max 3 hours or until 9 PM
    
    const contiguousSlots = [];
    for (let duration = 1; duration <= maxDuration; duration++) {
      const endHour = startHour + duration;
      if (endHour <= 21) {
        contiguousSlots.push(duration);
      }
    }
    
    return contiguousSlots;
  };
  
  const dates = generateDates();
  const timeSlots = availableTimeSlots;
  const availableDurations = selectedTime ? getContiguousSlots(selectedTime.time) : [1, 2, 3];

  const handleImageScroll = (event) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime && selectedDuration) {
      router.push({
        pathname: "/(tabs)/booking-summary",
        params: {
          pitchId: id,
          pitchName: pitch.name,
          date: selectedDate.toISOString(),
          time: selectedTime.time,
          duration: selectedDuration.toString(),
          basePricePerHour: pitch.basePricePerHour.toString(),
          totalPrice: pricing.total.toString(),
        },
      });
    }
  };

  const renderAmenity = (amenity, index) => (
    <View
      key={index}
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginRight: 16,
        alignItems: "center",
        minWidth: 120,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <amenity.icon size={24} color="#00FF88" />
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_500Medium",
          color: isDark ? "#FFFFFF" : "#000000",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        {amenity.name}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          color: isDark ? "#9CA3AF" : "#6B7280",
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {amenity.description}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}>
      <StatusBar style="light" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={{ position: "relative", height: 280 }}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {pitch.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: screenWidth, height: 280 }}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Header Overlay */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 16,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Share size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Heart size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Indicators */}
          <View
            style={{
              position: "absolute",
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {pitch.images.map((_, index) => (
              <View
                key={index}
                style={{
                  width: currentImageIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    currentImageIndex === index
                      ? "#00FF88"
                      : "rgba(255, 255, 255, 0.5)",
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Header Info */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Inter_700Bold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              {pitch.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Star size={16} color="#FFD700" />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                {pitch.rating}
              </Text>
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                ({pitch.reviews} reviews)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MapPin size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  flex: 1,
                }}
              >
                {pitch.location}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginBottom: 16,
              }}
            >
              {pitch.type} • {pitch.surface} • {pitch.distance} away
            </Text>

            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_700Bold",
                  color: "#00FF88",
                }}
              >
                {formatCurrency(pricing.total)}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  marginLeft: 8,
                }}
              >
                for {selectedDuration} hour{selectedDuration > 1 ? 's' : ''}
              </Text>
            </View>
            
            {/* First-time booking discount badge */}
            {isFirstTimeUser && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#00FF8820",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Tag size={14} color="#00FF88" />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#00FF88",
                  }}
                >
                  First booking discount available!
                </Text>
              </View>
            )}
            
            {pricing.firstBookingDiscount > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#00FF88",
                  marginBottom: 4,
                }}
              >
                Save {formatCurrency(pricing.firstBookingDiscount)} with first booking!
              </Text>
            )}
            
            {pricing.durationDiscount > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#00FF88",
                }}
              >
                Save {formatCurrency(pricing.durationDiscount)} with longer booking!
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 12,
              }}
            >
              About this pitch
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                lineHeight: 24,
              }}
            >
              {pitch.description}
            </Text>
          </View>

          {/* Amenities */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              Amenities
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {pitch.amenities.map(renderAmenity)}
            </ScrollView>
          </View>

          {/* Owner Info */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              {pitch.owner.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Star size={14} color="#FFD700" />
                <Text
                  style={{
                    marginLeft: 4,
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  {pitch.owner.rating} owner rating
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#00FF88",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Phone size={14} color="#000000" />
                <Text
                  style={{
                    marginLeft: 4,
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#000000",
                  }}
                >
                  Contact
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Duration Selection */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              Duration
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {availableDurations.map((duration) => {
                const durationPricing = calculatePricing(pitch.basePricePerHour, duration, isFirstTimeUser);
                const isSelected = selectedDuration === duration;
                const isDisabled = selectedTime && !selectedTime.canExtend && duration > 1;
                
                return (
                  <TouchableOpacity
                    key={duration}
                    onPress={() => !isDisabled && setSelectedDuration(duration)}
                    style={{
                      flex: 1,
                      backgroundColor: isSelected
                        ? "#00FF88"
                        : isDark
                          ? "#1E1E1E"
                          : "#FFFFFF",
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: isDark ? "#333333" : "#EAEAEA",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDark ? 0.3 : 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                    disabled={isDisabled}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <Timer size={20} color={isSelected ? "#000000" : "#00FF88"} />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontSize: 18,
                          fontFamily: "Inter_600SemiBold",
                          color: isSelected
                            ? "#000000"
                            : isDark
                              ? "#FFFFFF"
                              : "#000000",
                        }}
                      >
                        {duration}h
                      </Text>
                    </View>
                    
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_700Bold",
                        color: isSelected ? "#000000" : "#00FF88",
                        marginBottom: 4,
                      }}
                    >
                      {formatCurrency(durationPricing.total)}
                    </Text>
                    
                    {duration > 1 && durationPricing.durationDiscount > 0 && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_500Medium",
                          color: isSelected
                            ? "#000000"
                            : "#00FF88",
                        }}
                      >
                        Save {formatCurrency(durationPricing.durationDiscount)}
                      </Text>
                    )}
                    
                    {duration === 1 && isFirstTimeUser && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_500Medium",
                          color: isSelected
                            ? "#000000"
                            : "#00FF88",
                        }}
                      >
                        First booking!
                      </Text>
                    )}
                    
                    {duration === 1 && !isFirstTimeUser && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_400Regular",
                          color: isSelected
                            ? "#000000"
                            : isDark
                              ? "#9CA3AF"
                              : "#6B7280",
                        }}
                      >
                        Standard rate
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Pricing breakdown */}
            <View
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                marginTop: 16,
                borderWidth: 1,
                borderColor: isDark ? "#333333" : "#EAEAEA",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 8,
                }}
              >
                Price Breakdown
              </Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  Pitch rental ({selectedDuration}h)
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  {formatCurrency(pricing.subtotal)}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  Service fee
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  {formatCurrency(pricing.serviceFee)}
                </Text>
              </View>
              
              {pricing.firstBookingDiscount > 0 && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#00FF88",
                    }}
                  >
                    First booking discount (10%)
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#00FF88",
                    }}
                  >
                    -{formatCurrency(pricing.firstBookingDiscount)}
                  </Text>
                </View>
              )}
              
              {pricing.durationDiscount > 0 && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#00FF88",
                    }}
                  >
                    Duration discount
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#00FF88",
                    }}
                  >
                    -{formatCurrency(pricing.durationDiscount)}
                  </Text>
                </View>
              )}
              
              <View 
                style={{
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "#333333" : "#EAEAEA",
                  paddingTop: 8,
                  marginTop: 8,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_700Bold",
                      color: "#00FF88",
                    }}
                  >
                    {formatCurrency(pricing.total)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Calendar */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              Select Date
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => date.available && setSelectedDate(date.date)}
                  style={{
                    backgroundColor:
                      selectedDate?.getDate() === date.date.getDate()
                        ? "#00FF88"
                        : date.available
                          ? isDark
                            ? "#1E1E1E"
                            : "#FFFFFF"
                          : isDark
                            ? "#0F0F0F"
                            : "#F5F5F5",
                    borderRadius: 12,
                    padding: 16,
                    marginRight: 12,
                    alignItems: "center",
                    minWidth: 80,
                    opacity: date.available ? 1 : 0.5,
                  }}
                  disabled={!date.available}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color:
                        selectedDate?.getDate() === date.date.getDate()
                          ? "#000000"
                          : isDark
                            ? "#9CA3AF"
                            : "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {date.dayName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Inter_600SemiBold",
                      color:
                        selectedDate?.getDate() === date.date.getDate()
                          ? "#000000"
                          : isDark
                            ? "#FFFFFF"
                            : "#000000",
                    }}
                  >
                    {date.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Slots */}
          {selectedDate && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 16,
                }}
              >
                Available Times
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: -6,
                }}
              >
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => slot.available && setSelectedTime(slot)}
                    style={{
                      backgroundColor:
                        selectedTime?.time === slot.time
                          ? "#00FF88"
                          : slot.available
                            ? isDark
                              ? "#1E1E1E"
                              : "#FFFFFF"
                            : isDark
                              ? "#0F0F0F"
                              : "#F5F5F5",
                      borderRadius: 12,
                      padding: 12,
                      margin: 6,
                      alignItems: "center",
                      minWidth: 80,
                      opacity: slot.available ? 1 : 0.5,
                    }}
                    disabled={!slot.available}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color:
                          selectedTime?.time === slot.time
                            ? "#000000"
                            : isDark
                              ? "#FFFFFF"
                              : "#000000",
                      }}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View
        style={{
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#333333" : "#EAEAEA",
        }}
      >
        <TouchableOpacity
          onPress={handleBooking}
          style={{
            backgroundColor: selectedDate && selectedTime ? "#00FF88" : "#666",
            borderRadius: 16,
            minHeight: 56,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
          disabled={!selectedDate || !selectedTime}
        >
          <Calendar
            size={20}
            color={selectedDate && selectedTime ? "#000000" : "#CCCCCC"}
          />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: selectedDate && selectedTime ? "#000000" : "#CCCCCC",
            }}
          >
            {selectedDate && selectedTime
              ? `Book for ${formatCurrency(pricing.total)}`
              : "Select date & time to book"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
