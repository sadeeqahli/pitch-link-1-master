import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  CheckCircle,
  Apple,
  Smartphone,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { pitchId, pitchName, date, time, price, total } =
    useLocalSearchParams();

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card", "apple", "google"

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        Alert.alert("Error", "Please fill in all card details");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        "Payment Successful!",
        "Your booking has been confirmed. You'll receive a confirmation email shortly.",
        [
          {
            text: "View My Bookings",
            onPress: () => router.push("/(tabs)/bookings"),
          },
          {
            text: "Go to Home",
            onPress: () => router.push("/(tabs)/home"),
          },
        ],
      );
    }, 2000);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View
        style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}
      >
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
              Payment
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
          {/* Security Notice */}
          <View
            style={{
              backgroundColor: "#00FF8820",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Lock size={20} color="#00FF88" />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#00FF88",
                flex: 1,
              }}
            >
              Your payment is secured with 256-bit SSL encryption
            </Text>
          </View>

          {/* Payment Methods */}
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
              Payment Method
            </Text>

            {/* Card Payment */}
            <TouchableOpacity
              onPress={() => setPaymentMethod("card")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333333" : "#EAEAEA",
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    paymentMethod === "card"
                      ? "#00FF88"
                      : isDark
                        ? "#666"
                        : "#CCC",
                  backgroundColor:
                    paymentMethod === "card" ? "#00FF88" : "transparent",
                  marginRight: 16,
                }}
              />
              <CreditCard size={20} color={isDark ? "#FFFFFF" : "#000000"} />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 1,
                }}
              >
                Credit or Debit Card
              </Text>
            </TouchableOpacity>

            {/* Apple Pay */}
            <TouchableOpacity
              onPress={() => setPaymentMethod("apple")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333333" : "#EAEAEA",
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    paymentMethod === "apple"
                      ? "#00FF88"
                      : isDark
                        ? "#666"
                        : "#CCC",
                  backgroundColor:
                    paymentMethod === "apple" ? "#00FF88" : "transparent",
                  marginRight: 16,
                }}
              />
              <Apple size={20} color={isDark ? "#FFFFFF" : "#000000"} />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 1,
                }}
              >
                Apple Pay
              </Text>
            </TouchableOpacity>

            {/* Google Pay */}
            <TouchableOpacity
              onPress={() => setPaymentMethod("google")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    paymentMethod === "google"
                      ? "#00FF88"
                      : isDark
                        ? "#666"
                        : "#CCC",
                  backgroundColor:
                    paymentMethod === "google" ? "#00FF88" : "transparent",
                  marginRight: 16,
                }}
              />
              <Smartphone size={20} color={isDark ? "#FFFFFF" : "#000000"} />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 1,
                }}
              >
                Google Pay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card Details Form */}
          {paymentMethod === "card" && (
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
                Card Details
              </Text>

              {/* Cardholder Name */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                    marginBottom: 8,
                  }}
                >
                  Cardholder Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderWidth: 1,
                    borderColor: isDark ? "#333333" : "#EAEAEA",
                  }}
                  placeholder="John Smith"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                />
              </View>

              {/* Card Number */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                    marginBottom: 8,
                  }}
                >
                  Card Number
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderWidth: 1,
                    borderColor: isDark ? "#333333" : "#EAEAEA",
                  }}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={{ flexDirection: "row", marginBottom: 16 }}>
                {/* Expiry Date */}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: isDark ? "#FFFFFF" : "#000000",
                      marginBottom: 8,
                    }}
                  >
                    Expiry Date
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      fontFamily: "Inter_400Regular",
                      color: isDark ? "#FFFFFF" : "#000000",
                      borderWidth: 1,
                      borderColor: isDark ? "#333333" : "#EAEAEA",
                    }}
                    placeholder="MM/YY"
                    placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                    value={expiryDate}
                    onChangeText={(text) =>
                      setExpiryDate(formatExpiryDate(text))
                    }
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                {/* CVV */}
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: isDark ? "#FFFFFF" : "#000000",
                      marginBottom: 8,
                    }}
                  >
                    CVV
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      fontFamily: "Inter_400Regular",
                      color: isDark ? "#FFFFFF" : "#000000",
                      borderWidth: 1,
                      borderColor: isDark ? "#333333" : "#EAEAEA",
                    }}
                    placeholder="123"
                    placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          )}

          {/* Order Summary */}
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
              Order Summary
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                {pitchName}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                {price}
              </Text>
            </View>

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
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {new Date(date).toLocaleDateString("en-GB")} • {time}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Service fee: ₦2,500
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
                  ₦{parseFloat(total || 0).toLocaleString()}
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
              backgroundColor: isProcessing ? "#666" : "#00FF88",
              borderRadius: 16,
              minHeight: 56,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: "#CCCCCC",
                  }}
                >
                  Processing...
                </Text>
              </>
            ) : (
              <>
                {paymentMethod === "card" && (
                  <CreditCard size={20} color="#000000" />
                )}
                {paymentMethod === "apple" && (
                  <Apple size={20} color="#000000" />
                )}
                {paymentMethod === "google" && (
                  <Smartphone size={20} color="#000000" />
                )}
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: "#000000",
                  }}
                >
                  {paymentMethod === "card" && "Confirm and Pay"}
                  {paymentMethod === "apple" && "Pay with Apple Pay"}
                  {paymentMethod === "google" && "Pay with Google Pay"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
