import { Stack } from "expo-router";
import React from "react";

export default function ShiftStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ 
          title: "Shifts",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ 
          title: "Shift Detail",
          headerBackTitle: "", 
          headerShown: true,
        }}        
      />
      <Stack.Screen
        name="candidate/[id]"
        options={{
          headerShown: true,
          headerTitle: "Candidate Profile",
          headerBackTitle: "", 
        }}
      />
    </Stack>
  );
}