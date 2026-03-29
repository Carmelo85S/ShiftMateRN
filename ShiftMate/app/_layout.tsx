import { Stack } from "expo-router";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}