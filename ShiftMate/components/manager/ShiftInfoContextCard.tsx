import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet } from "react-native";

interface ShiftInfo {
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

interface InfoProps {
  shiftInfo: ShiftInfo;
  theme: any;
}

export const ShiftInfoContextCard = ({ shiftInfo, theme }: InfoProps) => {
  if (!shiftInfo) return null;

  return (
    <View style={[styles.shiftContextCard, { backgroundColor: theme.card }]}>
      <View style={[styles.shiftIconContainer, { backgroundColor: theme.tint + "15" }]}>
        <Ionicons name="calendar" size={18} color={theme.tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.shiftLabel, { color: theme.text + "60" }]}>
          APPLICATION FOR
        </Text>
        <Text style={[styles.shiftTitle, { color: theme.text }]}>
          {shiftInfo.title}
        </Text>
        <Text style={[styles.shiftDate, { color: theme.text + "80" }]}>
          {new Date(shiftInfo.shift_date).toLocaleDateString("it-IT", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}{" "}
          • {shiftInfo.start_time?.slice(0, 5)} - {shiftInfo.end_time?.slice(0, 5)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    shiftContextCard: { flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 25, alignItems: 'center', gap: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
    shiftIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    shiftLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5, marginBottom: 2 },
    shiftTitle: { fontSize: 15, fontWeight: "800" },
    shiftDate: { fontSize: 13, fontWeight: "600", marginTop: 2 },
});