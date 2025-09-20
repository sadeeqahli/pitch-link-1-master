import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

const SocialLoginButtons = ({ onGoogleSignIn, onAppleSignIn, loading = false }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn();
      }
    } catch (error) {
      Alert.alert('Error', 'Google Sign-in failed. Please try again.');
      console.error('Google Sign-in error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (onAppleSignIn) {
        await onAppleSignIn();
      }
    } catch (error) {
      Alert.alert('Error', 'Apple Sign-in failed. Please try again.');
      console.error('Apple Sign-in error:', error);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      {/* Separator */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 24,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: isDark ? '#333333' : '#E5E7EB',
          }}
        />
        <Text
          style={{
            marginHorizontal: 16,
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          or
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: isDark ? '#333333' : '#E5E7EB',
          }}
        />
      </View>

      {/* Social Login Buttons Container */}
      <View style={{ gap: 12 }}>
        {/* Google Sign-in Button */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            paddingVertical: 16,
            paddingHorizontal: 16,
            opacity: loading ? 0.6 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Image
            source={{
              uri: 'https://developers.google.com/identity/images/g-logo.png',
            }}
            style={{
              width: 20,
              height: 20,
              marginRight: 12,
            }}
            contentFit="contain"
          />
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_500Medium',
              color: '#374151',
            }}
          >
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Apple Sign-in Button - Only show on iOS */}
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={
              isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={{
              width: '100%',
              height: 52,
            }}
            onPress={handleAppleSignIn}
          />
        )}

        {/* Apple Sign-in Button for Android/Web */}
        {Platform.OS !== 'ios' && (
          <TouchableOpacity
            onPress={handleAppleSignIn}
            disabled={loading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000000',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 16,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_white.svg',
              }}
              style={{
                width: 20,
                height: 20,
                marginRight: 12,
              }}
              contentFit="contain"
            />
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_500Medium',
                color: '#FFFFFF',
              }}
            >
              Sign in with Apple
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SocialLoginButtons;