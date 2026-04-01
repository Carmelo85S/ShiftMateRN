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
    padding: 14, // Leggermente più compatto
    borderRadius: 24,
    borderWidth: 0, // Rimuoviamo il bordo netto
    marginBottom: 16, // Più spazio tra le card per farle respirare
    // Soft Shadow per l'effetto "galleggiamento"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  imageContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 0, // Via i bordi interni
    backgroundColor: 'rgba(0,0,0,0.03)', // Sfondo neutro per il fallback
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
    gap: 2 
  },
  title: { 
    fontSize: 17, 
    fontWeight: "700", // Da 800 a 700 per eleganza
    letterSpacing: -0.4 
  },
  detailsRow: { 
    flexDirection: "row", 
    gap: 12,
    marginTop: 4,
    alignItems: 'center'
  },
  infoItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 5,
    // Un leggero sfondo alle pillole di info le rende più leggibili
    backgroundColor: 'rgba(0,0,0,0.02)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  infoText: { 
    fontSize: 12, 
    fontWeight: "600", // Da 700 a 600
    opacity: 0.7
  },
  actionIcon: {
    marginLeft: 4,
    opacity: 0.3, // Rendiamo l'icona di navigazione meno invadente
  }
});