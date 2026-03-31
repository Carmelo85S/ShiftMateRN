import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function CreateShiftStack() {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: theme.text,
        },
      }}
    >
      <Stack.Screen name="index" 
        options={{ 
          title: "Post a New Shift",
          headerBackButtonDisplayMode: "minimal"
        }} />
    </Stack>
  );
}