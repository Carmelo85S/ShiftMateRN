import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol"; 

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#000' 
    }}>
      <Tabs.Screen 
        name="dashboard"
        options={{ 
          title: "Home", 
          tabBarIcon: ({color}) => <IconSymbol name="speedometer" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="shift"
        options={{ 
          title: "Shifts", 
          tabBarIcon: ({color}) => <IconSymbol name="calendar" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="createShift"
        options={{ 
          title: "Post", 
          tabBarIcon: ({color}) => <IconSymbol name="plus.circle" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile"
        options={{ 
          title: "Account", 
          tabBarIcon: ({color}) => <IconSymbol name="person.fill" color={color} /> 
        }} 
      />
      
    </Tabs>
  );
}