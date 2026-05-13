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
          title: "Create",
          headerBackButtonDisplayMode: "minimal"
        }} />
        <Stack.Screen name="createShift" 
        options={{ 
          title: "New shift",
          headerBackButtonDisplayMode: "minimal"
        }} />
        <Stack.Screen name="createDepartment" 
        options={{ 
          title: "New department",
          headerBackButtonDisplayMode: "minimal"
        }} />
    </Stack>
  );
}