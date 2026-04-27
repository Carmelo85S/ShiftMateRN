import { Ionicons } from "@expo/vector-icons";
import { Text, Pressable, View, StyleSheet } from "react-native";

export const MenuRowProfile = ({ label, icon, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress} 
    style={({ pressed }) => [
      styles.menuRow, 
      { backgroundColor: pressed ? theme.card : 'transparent' }
    ]}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={20} color={theme.text} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.icon} />
  </Pressable>
);

const styles = StyleSheet.create({
    menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 20 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconCircle: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 16, fontWeight: "600" },
})