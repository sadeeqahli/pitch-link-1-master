import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Star,
  FileText,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleContact = (type) => {
    switch (type) {
      case "phone":
        Linking.openURL("tel:+2348112345678");
        break;
      case "email":
        Linking.openURL("mailto:support@pitchlink.com");
        break;
      case "chat":
        Alert.alert("Live Chat", "Chat feature coming soon!");
        break;
      default:
        break;
    }
  };

  const supportItems = [
    {
      icon: HelpCircle,
      label: "Help Center",
      description: "FAQs and troubleshooting guides",
      onPress: () => Alert.alert("Help Center", "Browse our knowledge base"),
    },
    {
      icon: MessageCircle,
      label: "Live Chat",
      description: "Chat with our support team",
      onPress: () => handleContact("chat"),
    },
    {
      icon: Phone,
      label: "Call Support",
      description: "+234 81 1234 5678",
      onPress: () => handleContact("phone"),
    },
    {
      icon: Mail,
      label: "Email Support", 
      description: "support@pitchlink.com",
      onPress: () => handleContact("email"),
    },
    {
      icon: Star,
      label: "Rate PitchLink",
      description: "Share your app experience",
      onPress: () => Alert.alert("Rate App", "Rate us on the App Store"),
    },
    {
      icon: FileText,
      label: "Terms of Service",
      description: "App terms and conditions",
      onPress: () => Alert.alert("Terms", "View terms of service"),
    },
    {
      icon: Shield,
      label: "Privacy Policy", 
      description: "How we protect your data",
      onPress: () => Alert.alert("Privacy", "View privacy policy"),
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
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333333" : "#EAEAEA",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginLeft: -8, borderRadius: 12 }}
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
            Support & Help
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {supportItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 2,
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
              <item.icon size={20} color="#00FF88" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 2,
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {item.description}
              </Text>
            </View>

            <ChevronRight size={20} color={isDark ? "#9CA3AF" : "#9B9B9B"} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}