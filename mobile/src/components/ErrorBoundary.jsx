import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onRetry }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#FF6B0020',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={40} color="#FF6B00" />
        </View>

        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Inter_600SemiBold',
            color: isDark ? '#FFFFFF' : '#000000',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Something went wrong
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: isDark ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24,
          }}
        >
          We encountered an unexpected error. Please try again.
        </Text>

        <TouchableOpacity
          onPress={onRetry}
          style={{
            backgroundColor: '#00FF88',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={16} color="#000000" />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: '#000000',
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ErrorBoundary;