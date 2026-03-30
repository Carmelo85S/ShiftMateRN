import React from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

interface ShiftCardProps {
  // L'oggetto 'item' deve contenere 'image_url' (string | null)
  item: any; 
  onPress: () => void;
  variant?: "manager" | "worker";
}

export const ShiftCard = ({ item, onPress, variant = "manager" }: ShiftCardProps) => {
  const theme = Colors.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: variant === "worker" && pressed ? 0.98 : 1 }] 
        },
      ]}
    >
      <View style={styles.content}>
        {/* IMMAGINE SPECIFICA DEL TURNO (se selezionata) */}
        <View style={[styles.imageContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
          {item.image_url ? (
            <Image 
              key={item.image_url} // Forza il refresh se l'URL cambia
              source={{ uri: item.image_url }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            // Fallback se l'immagine non è stata selezionata
            <Ionicons name="briefcase-sharp" size={24} color={theme.icon} />
          )}
        </View>

        <View style={styles.mainInfo}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-sharp" size={14} color={theme.tint} />
              <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                {new Date(item.shift_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-sharp" size={14} color={theme.tint} />
              <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* INDICATORE D'AZIONE */}
        <View style={styles.actionIcon}>
          <Ionicons 
            name={variant === "worker" ? "arrow-forward-circle" : "chevron-forward"} 
            size={variant === "worker" ? 28 : 20} 
            color={variant === "worker" ? theme.text : theme.icon} 
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  mainInfo: { 
    flex: 1, 
    gap: 4 
  },
  title: { 
    fontSize: 18, 
    fontWeight: "800", 
    letterSpacing: -0.5 
  },
  detailsRow: { 
    flexDirection: "row", 
    gap: 10,
    marginTop: 4
  },
  infoItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4 
  },
  infoText: { 
    fontSize: 12, 
    fontWeight: "700" 
  },
  actionIcon: {
    marginLeft: 4,
  }
});