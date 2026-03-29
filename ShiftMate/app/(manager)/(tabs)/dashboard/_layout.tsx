import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerShown: true,           // Attiva la barra in alto
        headerShadowVisible: false,   // Toglie la linea sotto per un look più pulito
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: theme.text,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Dashboard" // Il titolo che vedrai in alto
        }} 
      />
    </Stack>
  );
}