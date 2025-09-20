import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Edit3,
  Save,
  X,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Auth hooks
  const { signIn, signOut, isReady, auth } = useAuth();
  const { data: user, loading: userLoading } = useUser();

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "John Smith",
    phone: "+234 81 1234 5678", // Changed to Nigerian format
    email: "john.smith@pitchlink.com",
    location: "Lagos, Nigeria", // Changed to Nigerian location
  });

  const [editingData, setEditingData] = useState(profileData);

  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  );

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Update profile data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || "John Smith",
        email: user.email || "john.smith@pitchlink.com",
      }));
      setEditingData((prev) => ({
        ...prev,
        name: user.name || "John Smith",
        email: user.email || "john.smith@pitchlink.com",
      }));
    }
  }, [user]);

  if (!fontsLoaded) {
    return null;
  }

  // Show sign in prompt if not authenticated
  if (isReady && !auth) {
    return (
      <View
        style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Sign In Required
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            Please sign in to view your profile
          </Text>
          <TouchableOpacity
            onPress={() => signIn()}
            style={{
              backgroundColor: "#00FF88",
              paddingHorizontal: 32,
              paddingVertical: 16,
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
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isReady || userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: isDark ? "#FFFFFF" : "#000000",
            fontFamily: "Inter_400Regular",
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 0);
  };

  const handleSaveProfile = () => {
    // Validate the data
    if (!editingData.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    // Save the changes
    setProfileData(editingData);
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingData(profileData);
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const renderPersonalInfoItem = (
    { icon: Icon, label, field, value, editable },
    index,
  ) => (
    <View
      key={index}
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
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
          <Icon size={20} color="#00FF88" />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 4,
            }}
          >
            {label}
          </Text>

          {isEditing && editable ? (
            <TextInput
              value={editingData[field]}
              onChangeText={(text) =>
                setEditingData((prev) => ({ ...prev, [field]: text }))
              }
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
                backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                borderWidth: 1,
                borderColor: "#00FF88",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginTop: 4,
              }}
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            />
          ) : (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              {value}
            </Text>
          )}
        </View>

        {!isEditing && editable && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Edit3 size={20} color={isDark ? "#9CA3AF" : "#9B9B9B"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMenuItem = ({ icon: Icon, label, value, onPress }, index) => (
    <TouchableOpacity
      key={index}
      onPress={onPress}
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
        <Icon size={20} color="#00FF88" />
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
          {label}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#9CA3AF" : "#6B7280",
          }}
        >
          {value}
        </Text>
      </View>

      <ChevronRight size={20} color={isDark ? "#9CA3AF" : "#9B9B9B"} />
    </TouchableOpacity>
  );

  const personalInfoItems = [
    {
      icon: User,
      label: "Full Name",
      field: "name",
      value: profileData.name,
      editable: true,
    },
    {
      icon: Phone,
      label: "Phone Number",
      field: "phone",
      value: profileData.phone,
      editable: true,
    },
    {
      icon: Mail,
      label: "Email Address",
      field: "email",
      value: profileData.email,
      editable: false, // Email should not be editable typically
    },
    {
      icon: MapPin,
      label: "Location",
      field: "location",
      value: profileData.location,
      editable: true,
    },
  ];

  const accountItems = [
    {
      icon: Calendar,
      label: "My Bookings",
      value: "View your pitch reservations",
      onPress: () => router.push("/(tabs)/bookings"),
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      value: "Manage your payment options",
      onPress: () => console.log("Payment Methods"),
    },
    {
      icon: Settings,
      label: "Account Settings",
      value: "Manage account and preferences",
      onPress: () => router.push("/account"),
    },
  ];

  const supportItems = [
    {
      icon: HelpCircle,
      label: "Support & Help",
      value: "Get help and contact support",
      onPress: () => router.push("/support"),
    },
    {
      icon: Star,
      label: "Rate PitchLink",
      value: "Share your experience",
      onPress: () => console.log("Rate PitchLink"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Fixed Header */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          borderBottomWidth: showHeaderBorder ? 1 : 0,
          borderBottomColor: isDark ? "#333333" : "#E6E6E6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Inter_700Bold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Profile
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Block */}
        <View style={{ alignItems: "center", marginBottom: 32, marginTop: 20 }}>
          {/* Avatar with Camera Badge */}
          <View style={{ position: "relative", marginBottom: 16 }}>
            <Image
              source={{ uri: profileImage }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 3,
                borderColor: "#00FF88",
              }}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={handleImagePicker}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#00FF88",
                borderWidth: 3,
                borderColor: isDark ? "#0A0A0A" : "#F8F9FA",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Camera size={16} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Name & Stats */}
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 4,
            }}
          >
            {user?.name || "John Smith"}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 16,
            }}
          >
            Football enthusiast since 2020
          </Text>

          {/* Quick Stats */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_700Bold",
                  color: "#00FF88",
                }}
              >
                12
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Bookings
              </Text>
            </View>

            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: isDark ? "#333333" : "#EAEAEA",
              }}
            />

            <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_700Bold",
                  color: "#00FF88",
                }}
              >
                4.8
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Rating
              </Text>
            </View>

            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: isDark ? "#333333" : "#EAEAEA",
              }}
            />

            <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_700Bold",
                  color: "#00FF88",
                }}
              >
                3
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Favorites
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={{ marginBottom: 32 }}>
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
              Personal Information
            </Text>

            {isEditing && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={{
                    backgroundColor: isDark ? "#333333" : "#E5E7EB",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <X size={16} color={isDark ? "#FFFFFF" : "#000000"} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={{
                    backgroundColor: "#00FF88",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Save size={16} color="#000000" />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#000000",
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {personalInfoItems.map((item, index) =>
            renderPersonalInfoItem(item, index),
          )}
        </View>

        {/* Account Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 16,
            }}
          >
            Account
          </Text>
          {accountItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Support Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 16,
            }}
          >
            Support
          </Text>
          {supportItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
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
              backgroundColor: "#FF6B0020",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <LogOut size={20} color="#FF6B00" />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FF6B00",
              }}
            >
              Sign Out
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              Sign out of your account
            </Text>
          </View>

          <ChevronRight size={20} color="#FF6B00" />
        </TouchableOpacity>

        {/* App Version */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            PitchLink v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
