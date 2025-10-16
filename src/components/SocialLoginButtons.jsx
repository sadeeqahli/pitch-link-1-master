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

      {/* Info Text */}
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: isDark ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
          }}
        >
          Social login options are currently unavailable.
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: isDark ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Please use email and password to sign in.
        </Text>
      </View>
    </View>
  );
};

export default SocialLoginButtons;