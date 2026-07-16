import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function ShiftStackLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerShown: true,

        headerBackButtonDisplayMode: "minimal",

        headerTintColor: theme.tint,

        headerStyle: {
          backgroundColor: theme.background,
        },

        headerTitleStyle: {
          fontWeight: "bold",
          color: theme.text,
        },

        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My shifts",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Shift Details",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />

      <Stack.Screen
        name="editShift"
        options={{
          title: "Edit shift",
          presentation: "card",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />

      <Stack.Screen
        name="history"
        options={{
          title: "History",
          presentation: "card",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </Stack>
  );
}
