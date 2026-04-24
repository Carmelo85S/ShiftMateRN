import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function ProfileStackLayout() {

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
      <Stack.Screen name="index" options={{ title: "Profile" }} />
        <Stack.Screen name="editProfile" options={{
          title: "", 
          presentation: "modal",
          headerBackVisible: false,
          }} />
     </Stack>
  );
}