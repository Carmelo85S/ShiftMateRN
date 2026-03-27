import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      {/* Schermata principale del profilo */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Profile",
        }}
      />

      {/* Schermata di modifica profilo */}
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
          headerTitle: "Candidate Profile",
        }}
      />
    </Stack>
  );
}