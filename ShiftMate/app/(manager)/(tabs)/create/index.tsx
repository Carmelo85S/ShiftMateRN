import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

export default function Create() {
  const theme = Colors.light;
  const router = useRouter();

  const ActionCard = ({ title, subtitle, icon, onPress, kpi }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.kpi, { color: theme.tint }]}>{kpi}</Text>
        <Ionicons name={icon} size={24} color={theme.text} />
      </View>
      
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>{subtitle}</Text>
      
      <View style={[styles.actionRow, { borderTopColor: "rgba(0,0,0,0.05)" }]}>
        <Text style={[styles.actionText, { color: theme.text }]}>PROCEED</Text>
        <Ionicons name="arrow-forward" size={16} color={theme.text} />
      </View>
    </Pressable>
  );

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={[styles.kpiHeader, { color: theme.tint }]}>MANAGEMENT TOOLS</Text>
        <Text style={[styles.title, { color: theme.text }]}>What do you{"\n"}want to do?</Text>
      </View>

      {/* OPTIONS SECTION */}
      <View style={styles.form}>
        <ActionCard 
          kpi="OPERATIONAL"
          title="POST A SHIFT"
          subtitle="Create a new opening for your staff and manage hourly rates."
          icon="calendar-sharp"
          onPress={() => router.push("/(manager)/(tabs)/create/createShift")}
        />

        <ActionCard 
          kpi="STRUCTURAL"
          title="ADD DEPARTMENT"
          subtitle="Setup a new cost center and define its monthly budget."
          icon="business-sharp"
          onPress={() => router.push("/(manager)/(tabs)/create/createDepartment")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  kpiHeader: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.8,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -1,
  },
  form: {
    gap: 20,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  kpi: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 20,
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  }
});