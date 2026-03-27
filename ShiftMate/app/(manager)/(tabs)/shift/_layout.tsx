import { Stack } from "expo-router";
import React from "react";

export default function ShiftStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Shifts", headerShown: true }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Shift Detail", headerShown: true }}
      />
    </Stack>
  );
}