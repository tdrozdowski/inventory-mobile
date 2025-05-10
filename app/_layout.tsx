import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeApiConfig, getBearerToken } from '@/constants/ApiConfig';
import { ConfigSheet } from '@/components/ConfigSheet';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isConfigSheetVisible, setIsConfigSheetVisible] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check if a token exists
  const checkToken = async () => {
    try {
      const token = await getBearerToken();
      setHasToken(!!token);
      // If no token exists, show the config sheet
      setIsConfigSheetVisible(!token);
    } catch (error) {
      console.error('Failed to check token:', error);
      setHasToken(false);
      setIsConfigSheetVisible(true);
    }
  };

  // Handle ConfigSheet close
  const handleConfigSheetClose = async () => {
    // Check if we have a token now
    await checkToken();
    // Always close the sheet, regardless of token existence
    setIsConfigSheetVisible(false);
    // Only navigate to the Items tab if we have a token
    if (hasToken) {
      // Navigate to the Items tab
      router.navigate('/items');
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize API configuration when the app starts
  useEffect(() => {
    const initApi = async () => {
      try {
        await initializeApiConfig();
        console.log('API configuration initialized');
        // Check for token after API is initialized
        await checkToken();
      } catch (error) {
        console.error('Failed to initialize API configuration:', error);
        setIsConfigSheetVisible(true);
      }
    };

    initApi();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />

        {/* Show ConfigSheet if no token exists */}
        <ConfigSheet
          isVisible={isConfigSheetVisible}
          onClose={handleConfigSheetClose}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
