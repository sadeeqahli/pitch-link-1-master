import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Receipt,
  Eye,
  Search,
  Filter,
  X,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useBookingStore, useBookingUIStore } from "@/utils/booking/store";
import BookingReceiptModal from "@/components/BookingReceiptModal";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  // All hooks must be called before any conditional returns
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  // Booking store hooks
  const { 
    bookings, 
    isLoading, 
    error, 
    loadBookings, 
    getCategorizedBookings,
    cancelBooking,
    clearError,
    searchBookings 
  } = useBookingStore();
  
  const { selectedTab, setSelectedTab, showReceipt } = useBookingUIStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Memoize the categorized bookings to prevent unnecessary recalculations
  const categorizedBookings = useMemo(() => {
    return getCategorizedBookings();
  }, [bookings]);

  // Memoize the load bookings function
  const memoizedLoadBookings = useCallback(() => {
    loadBookings();
  }, [loadBookings]);

  // Load bookings on component mount
  useEffect(() => {
    memoizedLoadBookings();
  }, [memoizedLoadBookings]);

  // Clear error when tab changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [selectedTab, error, clearError]);

  // Apply search and filters
  useEffect(() => {
    const applyFilters = () => {
      let currentBookings = categorizedBookings[selectedTab] || [];
      
      if (searchTerm.trim()) {
        currentBookings = searchBookings(searchTerm, { status: [selectedTab] });
        // Filter by current tab after search
        if (selectedTab !== 'all') {
          const tabBookings = categorizedBookings[selectedTab] || [];
          currentBookings = currentBookings.filter(booking => 
            tabBookings.some(tabBooking => tabBooking.id === booking.id)
          );
        }
      }
      
      setFilteredBookings(currentBookings);
    };
    
    applyFilters();
  }, [searchTerm, selectedTab, categorizedBookings, searchBookings]);

  // Early return after all hooks are called
  if (!fontsLoaded) {
    return null;
  }
  
  const currentBookings = filteredBookings.length > 0 || searchTerm ? filteredBookings : categorizedBookings[selectedTab] || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId, bookingName) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking for ${bookingName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  const handleViewReceipt = (booking) => {
    showReceipt(booking);
  };

  const handleContactVenue = (phoneNumber) => {
    Alert.alert(
      "Contact Venue",
      `Call ${phoneNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => console.log(`Calling ${phoneNumber}`) },
      ]
    );
  };



  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#00FF88";
      case "completed":
        return "#0066FF";
      case "cancelled":
        return "#FF6B00";
      default:
        return "#9CA3AF";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      const numericAmount = parseFloat(amount.replace(/[₦,]/g, ''));
      return `₦${numericAmount.toLocaleString()}`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const renderBookingCard = (booking) => {
    const StatusIcon = getStatusIcon(booking.status);
    const statusColor = getStatusColor(booking.status);

    return (
      <TouchableOpacity
        key={booking.id}
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
        onPress={() => handleViewReceipt(booking)}
      >
        <View style={{ flexDirection: "row", padding: 16 }}>
          <Image
            source={{ uri: booking.pitchImage }}
            style={{ width: 80, height: 80, borderRadius: 12 }}
            contentFit="cover"
          />

          <View style={{ flex: 1, marginLeft: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 1,
                  marginRight: 8,
                }}
              >
                {booking.pitchName}
              </Text>
              <TouchableOpacity>
                <MoreVertical
                  size={16}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Calendar size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {formatDate(booking.date)} • {booking.time} ({booking.duration}h)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MapPin size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {booking.location}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <StatusIcon size={14} color={statusColor} />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: statusColor,
                    textTransform: "capitalize",
                  }}
                >
                  {booking.status}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#00FF88",
                }}
              >
                {formatCurrency(booking.totalPrice || booking.price)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 8,
          }}
        >
          {selectedTab === "upcoming" && (
            <>
              <TouchableOpacity
                onPress={() => handleCancelBooking(booking.id, booking.pitchName)}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: isDark ? "#333333" : "#EAEAEA",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleContactVenue(booking.venueContact)}
                style={{
                  flex: 1,
                  backgroundColor: "#00FF88",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  marginLeft: 8,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Phone size={14} color="#000000" />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#000000",
                  }}
                >
                  Contact
                </Text>
              </TouchableOpacity>
            </>
          )}
          
          {(selectedTab === "past" || selectedTab === "cancelled") && (
            <TouchableOpacity
              onPress={() => handleViewReceipt(booking)}
              style={{
                flex: 1,
                backgroundColor: "#00FF88",
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Receipt size={14} color="#000000" />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#000000",
                }}
              >
                View Receipt
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Booking Reference */}
        <View
          style={{
            backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            Booking Reference: {booking.bookingRef}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: categorizedBookings.upcoming.length },
    { id: "past", label: "Past", count: categorizedBookings.past.length },
    {
      id: "cancelled",
      label: "Cancelled",
      count: categorizedBookings.cancelled.length,
    },
  ];

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
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: showSearch ? 16 : 0,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Inter_700Bold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            My Bookings
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: showSearch ? "#00FF88" : isDark ? "#1E1E1E" : "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {showSearch ? (
              <X size={20} color="#000000" />
            ) : (
              <Search size={20} color={isDark ? "#FFFFFF" : "#000000"} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        {showSearch && (
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Search size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
              placeholder="Search by pitch name, location, or booking reference..."
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchTerm("")}
                style={{
                  padding: 4,
                  borderRadius: 12,
                }}
              >
                <X size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 12,
            padding: 4,
            flexDirection: "row",
          }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              style={{
                flex: 1,
                backgroundColor:
                  selectedTab === tab.id ? "#00FF88" : "transparent",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color:
                    selectedTab === tab.id
                      ? "#000000"
                      : isDark
                        ? "#9CA3AF"
                        : "#6B7280",
                }}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={"#00FF88"}
            colors={["#00FF88"]}
          />
        }
      >
        {error && (
          <View
            style={{
              backgroundColor: "#FF6B0020",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FF6B00",
                marginBottom: 4,
              }}
            >
              Error Loading Bookings
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#FF6B00",
              }}
            >
              {error}
            </Text>
          </View>
        )}
        
        {/* Search Results Counter */}
        {searchTerm && (
          <View
            style={{
              paddingBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              {currentBookings.length} result{currentBookings.length !== 1 ? 's' : ''} found for "{searchTerm}"
            </Text>
          </View>
        )}
        
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              Loading bookings...
            </Text>
          </View>
        ) : currentBookings.length > 0 ? (
          currentBookings.map(renderBookingCard)
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Calendar size={32} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {searchTerm 
                ? "No bookings found" 
                : `No ${selectedTab} bookings`}
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 40,
              }}
            >
              {searchTerm
                ? `No bookings match "${searchTerm}". Try a different search term.`
                : selectedTab === "upcoming" &&
                  "Book your first pitch to get started"}
              {searchTerm
                ? ""
                : selectedTab === "past" &&
                  "Your completed bookings will appear here"}
              {searchTerm
                ? ""
                : selectedTab === "cancelled" &&
                  "Your cancelled bookings will appear here"}
            </Text>

            {selectedTab === "upcoming" && !searchTerm && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/search")}
                style={{
                  backgroundColor: "#00FF88",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginTop: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#000000",
                  }}
                >
                  Find Pitches
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Receipt Modal */}
      <BookingReceiptModal />
    </View>
  );
}
