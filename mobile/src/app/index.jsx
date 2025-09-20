import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/utils/auth/useAuth";

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await SecureStore.getItemAsync(ONBOARDING_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.log('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (isReady) {
      checkOnboardingStatus();
    }
  }, [isReady]);

  // Show loading while checking status
  if (!isReady || isLoading) {
    return null;
  }

  // FOR TESTING: Always show onboarding first (uncomment the line below)
  // return <Redirect href="/onboarding" />;

  // If user hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // If user completed onboarding but not authenticated, show auth
  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  // If user is authenticated, go to main app
  return <Redirect href="/(tabs)/home" />;
}
