import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Share,
  Alert,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  X,
  Download,
  Share2,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  QrCode,
  PrinterIcon,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useBookingUIStore } from "@/utils/booking/store";

// QR Code placeholder component (you might want to use react-native-qrcode-svg)
const QRCodePlaceholder = ({ value, size = 100 }) => {
  const isDark = useColorScheme() === "dark";
  
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <QrCode size={size * 0.8} color="#000000" />
    </View>
  );
};

export default function BookingReceiptModal() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const { 
    showReceiptModal, 
    selectedBookingForReceipt, 
    hideReceipt 
  } = useBookingUIStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded || !selectedBookingForReceipt) {
    return null;
  }

  const booking = selectedBookingForReceipt;
  const receipt = booking.receipt;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleShare = async () => {
    try {
      const shareText = `🎯 PitchLink Booking Receipt
      
📍 ${booking.pitchName}
📅 ${formatDate(booking.date)} at ${booking.time}
⏱️ Duration: ${booking.duration} hour${booking.duration > 1 ? 's' : ''}
💰 Total: ${formatCurrency(receipt.pricing.total)}
🔗 Booking Ref: ${booking.bookingRef}

Status: ✅ APPROVED

Download the PitchLink app to manage your bookings!`;

      await Share.share({
        message: shareText,
        title: "PitchLink Booking Receipt",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share receipt");
    }
  };

  const handleSaveToGallery = () => {
    Alert.alert(
      "Save Receipt",
      "Receipt saved to your device gallery",
      [{ text: "OK" }]
    );
  };

  const handlePrint = () => {
    Alert.alert(
      "Print Receipt",
      "Receipt sent to printer",
      [{ text: "OK" }]
    );
  };

  const StatusBadge = () => (
    <View
      style={{
        backgroundColor: "#00FF8820",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: "center",
        marginVertical: 20,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <CheckCircle size={24} color="#00FF88" />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 20,
            fontFamily: "Inter_700Bold",
            color: "#00FF88",
          }}
        >
          APPROVED
        </Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_400Regular",
          color: "#00FF88",
        }}
      >
        Your booking has been confirmed
      </Text>
    </View>
  );

  return (
    <Modal
      visible={showReceiptModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View
        style={{ 
          flex: 1, 
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" 
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#333333" : "#EAEAEA",
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
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Booking Receipt
            </Text>
            <TouchableOpacity
              onPress={hideReceipt}
              style={{
                padding: 8,
                borderRadius: 12,
                backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              }}
            >
              <X size={20} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Receipt Header */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              marginTop: 20,
              marginBottom: 16,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Inter_700Bold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              PitchLink Receipt
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginBottom: 4,
              }}
            >
              Booking Reference
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#00FF88",
              }}
            >
              {booking.bookingRef}
            </Text>

            <StatusBadge />

            {/* QR Code */}
            <View style={{ alignItems: "center", marginTop: 12 }}>
              <QRCodePlaceholder value={receipt.qrCode} size={120} />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Scan to verify booking
              </Text>
            </View>
          </View>

          {/* Pitch Information */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Image
              source={{ uri: booking.pitchImage }}
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
                {booking.pitchName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <MapPin size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text
                  style={{
                    marginLeft: 4,
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    flex: 1,
                  }}
                >
                  {booking.location}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {booking.pitchType} • {booking.surface}
              </Text>
            </View>
          </View>

          {/* Booking Details */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
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
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
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
                  {formatDate(booking.date)}
                </Text>
              </View>
            </View>

            {/* Time & Duration */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
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
                  Time & Duration
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  {booking.time} ({booking.duration} hour{booking.duration > 1 ? 's' : ''})
                </Text>
              </View>
            </View>

            {/* Contact */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                <Phone size={20} color="#00FF88" />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  Venue Contact
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  {booking.venueContact}
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing Breakdown */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
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

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Pitch rental ({receipt.pricing.duration}h)
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                {formatCurrency(receipt.pricing.subtotal)}
              </Text>
            </View>

            {receipt.pricing.discount > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
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
                  -{formatCurrency(receipt.pricing.discount)}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
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
                {formatCurrency(receipt.pricing.serviceFee)}
              </Text>
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: isDark ? "#333333" : "#EAEAEA",
                paddingTop: 16,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  Total Paid
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_700Bold",
                    color: "#00FF88",
                  }}
                >
                  {formatCurrency(receipt.pricing.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
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

            {receipt.terms.map((term, index) => (
              <View key={index} style={{ flexDirection: "row", marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: "#00FF88",
                    marginRight: 8,
                  }}
                >
                  •
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    flex: 1,
                    lineHeight: 20,
                  }}
                >
                  {term}
                </Text>
              </View>
            ))}
          </View>

          {/* Receipt Footer */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 4,
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
              Thank you for choosing PitchLink!
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Issue Date: {new Date(receipt.issueDate).toLocaleDateString("en-GB")}
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#333333" : "#EAEAEA",
          }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleSaveToGallery}
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: isDark ? "#333333" : "#EAEAEA",
              }}
            >
              <Download size={18} color={isDark ? "#FFFFFF" : "#000000"} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Save
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={{
                flex: 1,
                backgroundColor: "#00FF88",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Share2 size={18} color="#000000" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#000000",
                }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}