// app/(manager)/(tabs)/profile/_layout.tsx
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "", 
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="editProfile"
        options={{
          headerShown: true,
          headerTitle: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerBackVisible: false, 
        }}
      />
    </Stack>
  );
}