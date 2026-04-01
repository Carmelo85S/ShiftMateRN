import { Stack } from "expo-router";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { useAssets } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [assets, error] = useAssets([
    require("../assets/images/hero.webp"),
  ]);

  useEffect(() => {
    if (assets || error) {
      SplashScreen.hideAsync();
    }
  }, [assets, error]);

  if (!assets && !error) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}