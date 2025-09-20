import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Clock,
  Filter,
  TrendingUp,
  ArrowRight,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    availability: 'all', // 'all', 'available', 'busy'
    pitchType: 'all', // 'all', '5-a-side', '7-a-side', '11-a-side'
    location: 'all', // 'all', 'nearby'
  });
  const [filteredPitches, setFilteredPitches] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const nearbyPitches = [
    {
      id: 1,
      name: "Greenfield Stadium",
      image:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
      rating: 4.8,
      distance: "0.5 km",
      price: "₦12,500/hour",
      available: true,
      type: "5-a-side",
    },
    {
      id: 2,
      name: "City Sports Complex",
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      rating: 4.6,
      distance: "1.2 km",
      price: "₦15,000/hour",
      available: true,
      type: "11-a-side",
    },
    {
      id: 3,
      name: "Riverside Football Ground",
      image:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
      rating: 4.7,
      distance: "2.1 km",
      price: "₦10,000/hour",
      available: false,
      type: "7-a-side",
    },
  ];

  const recommendedPitches = [
    {
      id: 4,
      name: "Elite Football Academy",
      image:
        "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop",
      rating: 4.9,
      location: "Central London",
      price: "₦17,500/hour",
      features: ["Floodlit", "Parking", "Changing Rooms"],
      type: "5-a-side",
      available: true,
    },
    {
      id: 5,
      name: "Parkside Pitch",
      image:
        "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop",
      rating: 4.5,
      location: "North London",
      price: "₦11,000/hour",
      features: ["Natural Grass", "Parking"],
      type: "11-a-side",
      available: true,
    },
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: "/(tabs)/search",
        params: { query: searchText }
      });
    } else {
      router.push("/(tabs)/search");
    }
  };
  
  const applyQuickFilter = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Filter pitches based on selected filters
  const getFilteredPitches = (pitches) => {
    return pitches.filter(pitch => {
      // Availability filter
      if (selectedFilters.availability === 'available' && !pitch.available) return false;
      if (selectedFilters.availability === 'busy' && pitch.available) return false;
      
      // Pitch type filter (for recommended pitches that have type info)
      if (selectedFilters.pitchType !== 'all' && pitch.type) {
        if (!pitch.type.toLowerCase().includes(selectedFilters.pitchType.toLowerCase())) return false;
      }
      
      return true;
    });
  };

  const handlePitchPress = (pitchId) => {
    router.push(`/(tabs)/pitch/${pitchId}`);
  };

  const renderNearbyPitch = (pitch) => (
    <TouchableOpacity
      key={pitch.id}
      onPress={() => handlePitchPress(pitch.id)}
      style={{
        marginRight: 16,
        width: 280,
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Image
        source={{ uri: pitch.image }}
        style={{ width: "100%", height: 160 }}
        contentFit="cover"
      />
      <View style={{ padding: 16 }}>
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
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
              flex: 1,
            }}
          >
            {pitch.name}
          </Text>
          <View
            style={{
              backgroundColor: pitch.available ? "#00FF8820" : "#FF6B0020",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: pitch.available ? "#00FF88" : "#FF6B00",
              }}
            >
              {pitch.available ? "Available" : "Busy"}
            </Text>
          </View>
        </View>

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
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {pitch.rating}
          </Text>
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark ? "#666" : "#CCC",
              marginHorizontal: 8,
            }}
          />
          <MapPin size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
          <Text
            style={{
              marginLeft: 4,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            {pitch.distance}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#00FF88",
          }}
        >
          {pitch.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendedPitch = (pitch) => (
    <TouchableOpacity
      key={pitch.id}
      onPress={() => handlePitchPress(pitch.id)}
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
      <View style={{ flexDirection: "row" }}>
        <Image
          source={{ uri: pitch.image }}
          style={{ width: 120, height: 120, borderRadius: 16 }}
          contentFit="cover"
        />
        <View style={{ flex: 1, padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
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
            <Star size={14} color="#FFD700" />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#FFFFFF" : "#000000",
                marginRight: 8,
              }}
            >
              {pitch.rating}
            </Text>
            <MapPin size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              {pitch.location}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 8,
            }}
          >
            {pitch.features.join(" • ")}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#00FF88",
            }}
          >
            {pitch.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Inter_700Bold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Welcome back!
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginTop: 4,
              }}
            >
              Find your perfect pitch
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Search size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          <TextInput
            style={{
              marginLeft: 12,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
              flex: 1,
            }}
            placeholder="Search pitches near you..."
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Filter size={20} color="#00FF88" />
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <TouchableOpacity
            onPress={() => applyQuickFilter('availability', selectedFilters.availability === 'available' ? 'all' : 'available')}
            style={{
              backgroundColor: selectedFilters.availability === 'available' ? "#00FF88" : "#00FF8820",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: selectedFilters.availability === 'available' ? "#000000" : "#00FF88",
              }}
            >
              Available Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => applyQuickFilter('pitchType', selectedFilters.pitchType === '5-a-side' ? 'all' : '5-a-side')}
            style={{
              backgroundColor: selectedFilters.pitchType === '5-a-side' ? "#00FF88" : isDark ? "#1E1E1E" : "#FFFFFF",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: selectedFilters.pitchType === '5-a-side' ? "#000000" : isDark ? "#FFFFFF" : "#000000",
              }}
            >
              5-a-side
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => applyQuickFilter('pitchType', selectedFilters.pitchType === '11-a-side' ? 'all' : '11-a-side')}
            style={{
              backgroundColor: selectedFilters.pitchType === '11-a-side' ? "#00FF88" : isDark ? "#1E1E1E" : "#FFFFFF",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: selectedFilters.pitchType === '11-a-side' ? "#000000" : isDark ? "#FFFFFF" : "#000000",
              }}
            >
              11-a-side
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* News Link */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/news")}
          style={{
            backgroundColor: "#00FF8820",
            marginHorizontal: 20,
            padding: 16,
            borderRadius: 16,
            marginBottom: 24,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TrendingUp size={24} color="#00FF88" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#00FF88",
              }}
            >
              Football News & Live Scores
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#00FF88",
                marginTop: 2,
              }}
            >
              Stay updated with the latest matches
            </Text>
          </View>
          <ArrowRight size={20} color="#00FF88" />
        </TouchableOpacity>

        {/* Nearby Pitches */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Pitches Near You
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#00FF88",
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
          >
            {getFilteredPitches(nearbyPitches).map(renderNearbyPitch)}
          </ScrollView>
        </View>

        {/* Recommended Pitches */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
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
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Top-Rated Pitches
            </Text>
          </View>

          {getFilteredPitches(recommendedPitches).map(renderRecommendedPitch)}
        </View>
      </ScrollView>
    </View>
  );
}
