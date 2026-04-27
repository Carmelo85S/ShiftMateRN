import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";

export const HistoryItem = ({ item, theme }: any) => (
  <View style={styles.itemWrapper}>
    <ShiftCard 
      item={item} 
      variant="manager" 
      onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)} 
    />
    {item.assignedWorker && (
      <View style={styles.workerTag}>
        <Ionicons name="person-circle-outline" size={14} color={theme.secondaryText} />
        <Text style={[styles.workerName, { color: theme.secondaryText }]}>
          Worked: {item.assignedWorker.name} {item.assignedWorker.surname}
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  itemWrapper: { marginBottom: 16, opacity: 0.6 },
  workerTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 12 },
  workerName: { fontSize: 12, fontWeight: "600" },
});