import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
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

export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { 
    pitchId, 
    pitchName, 
    date, 
    time, 
    duration,
    basePricePerHour,
    totalPrice 
  } = useLocalSearchParams();
  
  // Get user booking status for first-time discount
  const { checkFirstTimeBookingEligibility } = useUserStore();
  const isFirstTimeUser = checkFirstTimeBookingEligibility();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Add safety checks for required parameters
  if (!pitchId || !pitchName || !date || !time || !duration || !basePricePerHour) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Missing Booking Information
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Please go back and select a pitch to book.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#00FF88",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#000000",
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Parse the date with safety check
  const bookingDate = new Date(date);
  const formattedDate = bookingDate.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate costs with safety checks and first-time discount
  const durationHours = parseInt(duration) || 1;
  const basePrice = parseFloat(basePricePerHour) || 0;
  const pricing = calculatePricing(basePrice, durationHours, isFirstTimeUser);
  
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handlePayment = () => {
    router.push({
      pathname: "/(tabs)/payment",
      params: {
        pitchId,
        pitchName,
        date,
        time,
        duration,
        basePricePerHour,
        totalPrice: pricing.total.toString(),
      },
    });
  };

  const pitchImage =
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333333" : "#EAEAEA",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              marginLeft: -8,
              borderRadius: 12,
            }}
          >
            <ArrowLeft size={20} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text
            style={{
              marginLeft: 8,
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Booking Summary
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* First-time Booking Highlight */}
        {isFirstTimeUser && (
          <View
            style={{
              backgroundColor: "#00FF8820",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#00FF88",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Tag size={24} color="#00FF88" />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: "#00FF88",
                }}
              >
                First Booking Discount Applied!
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#00FF88",
                lineHeight: 24,
              }}
            >
              Congratulations! You're saving {formatCurrency(pricing.firstBookingDiscount)} on your first booking with PitchLink. 
              Welcome to the community!
            </Text>
          </View>
        )}
        
        {/* Pitch Details Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Image
            source={{ uri: pitchImage }}
            style={{
              width: "100%",
              height: 160,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            contentFit="cover"
          />
          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              {pitchName}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Lagos, Nigeria
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
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
              marginBottom: 16,
            }}
          >
            Booking Details
          </Text>

          {/* Date */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#00FF8820",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Calendar size={20} color="#00FF88" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Date
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#00FF8820",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Clock size={20} color="#00FF88" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Time
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {time} ({durationHours} hour{durationHours > 1 ? 's' : ''})
              </Text>
            </View>
          </View>

          {/* Duration */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#00FF8820",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Users size={20} color="#00FF88" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Pitch Type
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                5-a-side • Artificial Grass
              </Text>
            </View>
          </View>
        </View>

        {/* Important Information */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
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
              marginBottom: 16,
            }}
          >
            Important Information
          </Text>

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <CheckCircle size={16} color="#00FF88" style={{ marginTop: 2 }} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Please arrive 10 minutes before your booking time
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <CheckCircle size={16} color="#00FF88" style={{ marginTop: 2 }} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Free cancellation up to 2 hours before the booking
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <CheckCircle size={16} color="#00FF88" style={{ marginTop: 2 }} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Changing rooms and parking available on-site
              </Text>
            </View>
          </View>

          <View>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <CheckCircle size={16} color="#00FF88" style={{ marginTop: 2 }} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Contact the venue at +44 20 1234 5678 for any questions
              </Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
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
              marginBottom: 16,
            }}
          >
            Price Breakdown
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Pitch rental ({durationHours}h)
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {formatCurrency(pricing.subtotal)}
            </Text>
          </View>

          {pricing.firstBookingDiscount > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: "#00FF88",
                  }}
                >
                  First booking discount (10%)
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#00FF88",
                    marginTop: 2,
                  }}
                >
                  Welcome to PitchLink!
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#00FF88",
                }}
              >
                -{formatCurrency(pricing.firstBookingDiscount)}
              </Text>
            </View>
          )}
          
          {pricing.durationDiscount > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#00FF88",
                }}
              >
                Duration discount
              </Text>
              <Text
                style={{
                  fontSize: 16,
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
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Service fee
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {formatCurrency(pricing.serviceFee)}
            </Text>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? "#333333" : "#EAEAEA",
              paddingTop: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_700Bold",
                  color: "#00FF88",
                }}
              >
                {formatCurrency(pricing.total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#333333" : "#EAEAEA",
        }}
      >
        <TouchableOpacity
          onPress={handlePayment}
          style={{
            backgroundColor: "#00FF88",
            borderRadius: 16,
            minHeight: 56,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <CreditCard size={20} color="#000000" />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: "#000000",
            }}
          >
            Proceed to Payment • {formatCurrency(pricing.total)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
