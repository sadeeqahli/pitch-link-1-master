import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import {
  MapPin,
  Calendar,
  Trophy,
  Users,
  ArrowRight,
  ChevronRight,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const ONBOARDING_KEY = 'hasCompletedOnboarding';

const { width: screenWidth } = Dimensions.get("window");

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const onboardingScreens = [
    {
      icon: MapPin,
      title: "Find Pitches Near You",
      subtitle:
        "Discover amazing football pitches in your area and book instantly",
      color: "#00D2FF",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      subtitle:
        "Reserve your perfect pitch in just a few taps with flexible timing",
      color: "#00FF88",
    },
    {
      icon: Trophy,
      title: "Top-Rated Venues",
      subtitle: "Play at the best pitches with verified reviews and ratings",
      color: "#FF6B00",
    },
    {
      icon: Users,
      title: "Connect & Play",
      subtitle: "Join the football community and never miss a game",
      color: "#8B5CF6",
    },
  ];

  const handleNext = async () => {
    if (currentIndex < onboardingScreens.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      // Mark onboarding as complete
      try {
        await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      } catch (error) {
        console.log('Error saving onboarding status:', error);
      }
      router.push("/auth");
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as complete when skipped
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
    router.push("/auth");
  };

  const onScroll = (event) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#000000" }}>
      <StatusBar style="light" />

      {/* Logo */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Image
          source={{
            uri: "https://ucarecdn.com/5a14b9a2-5a17-44ae-af07-ce9687d3e50c/-/format/auto/",
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
          }}
          contentFit="contain"
        />
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_700Bold",
            color: "#00FF88",
            marginTop: 16,
            letterSpacing: -0.5,
          }}
        >
          PitchLink
        </Text>
      </View>

      {/* Skip Button */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 20,
          right: 20,
          zIndex: 1,
        }}
      >
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontFamily: "Inter_500Medium",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Screens */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {onboardingScreens.map((screen, index) => (
          <View
            key={index}
            style={{
              width: screenWidth,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 40,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: `${screen.color}20`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40,
              }}
            >
              <screen.icon size={48} color={screen.color} />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Inter_700Bold",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 34,
              }}
            >
              {screen.title}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#AAAAAA",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {screen.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 20,
        }}
      >
        {/* Page Indicators */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {onboardingScreens.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  currentIndex === index
                    ? "#00FF88"
                    : "rgba(255, 255, 255, 0.3)",
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: "#00FF88",
            borderRadius: 16,
            minHeight: 56,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: "#000000",
              marginRight: 8,
            }}
          >
            {currentIndex === onboardingScreens.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
          {currentIndex === onboardingScreens.length - 1 ? (
            <ArrowRight size={20} color="#000000" />
          ) : (
            <ChevronRight size={20} color="#000000" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
