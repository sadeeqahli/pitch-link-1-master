import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useAuth } from "@/utils/auth/useAuth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (isSignUp && !formData.name.trim()) {
      Alert.alert("Error", "Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      Alert.alert("Error", "Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    if (isSignUp && formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        await signIn({
          email: formData.email,
          password: formData.password,
        });
      }
      // Redirect to main app after successful authentication
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Google Sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Apple Sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={20} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Image
            source={{
              uri: "https://ucarecdn.com/5a14b9a2-5a17-44ae-af07-ce9687d3e50c/-/format/auto/",
            }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              marginBottom: 16,
            }}
            contentFit="contain"
          />
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Inter_700Bold",
              color: "#00FF88",
              marginBottom: 8,
            }}
          >
            Welcome to PitchLink
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              textAlign: "center",
            }}
          >
            {isSignUp
              ? "Create your account to start booking pitches"
              : "Sign in to continue your football journey"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Auth Form */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>

          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 8,
                }}
              >
                Full Name
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#333333" : "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <User size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email Field */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Email Address
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#333333" : "#E5E7EB",
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              <Mail size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: isSignUp ? 20 : 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#333333" : "#E5E7EB",
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              <Lock size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
                placeholder={
                  isSignUp
                    ? "Create a password (min. 6 characters)"
                    : "Enter your password"
                }
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ marginLeft: 12 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                ) : (
                  <Eye size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 8,
                }}
              >
                Confirm Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#333333" : "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <Lock size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    handleInputChange("confirmPassword", text)
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ marginLeft: 12 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                  ) : (
                    <Eye size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#666" : "#00FF88",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: loading ? "#CCCCCC" : "#000000",
              }}
            >
              {loading
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing In..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Toggle Auth Mode */}
          <TouchableOpacity onPress={toggleAuthMode} style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Text
                style={{
                  color: "#00FF88",
                  fontFamily: "Inter_500Medium",
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Social Login Buttons */}
          <SocialLoginButtons
            onGoogleSignIn={handleGoogleSignIn}
            onAppleSignIn={handleAppleSignIn}
            loading={loading}
          />
        </View>

        {/* Terms and Privacy (Sign Up Only) */}
        {isSignUp && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            By creating an account, you agree to our{" "}
            <Text style={{ color: "#00FF88" }}>Terms of Service</Text> and{" "}
            <Text style={{ color: "#00FF88" }}>Privacy Policy</Text>
          </Text>
        )}
      </ScrollView>
    </View>
  );
}