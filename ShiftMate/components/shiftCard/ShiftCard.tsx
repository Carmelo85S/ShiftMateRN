import React from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

interface ShiftCardProps {
  item: {
    id: string;
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    image_url: string | null;
  };
  onPress: () => void;
  variant?: "manager" | "worker";
}

export const ShiftCard = ({ item, onPress, variant = "manager" }: ShiftCardProps) => {
  const theme = Colors.light;

  // Verifichiamo che l'URL esista e aggiungiamo un timestamp per "bucare" la cache 
  // se l'immagine è stata appena aggiornata con lo stesso nome.
  const imageSource = item.image_url 
    ? { uri: `${item.image_url}?t=${new Date(item.shift_date).getTime()}` } 
    : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }] 
        },
      ]}
    >
      <View style={styles.content}>
        {/* CONTAINER IMMAGINE */}
        <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
          {item.image_url ? (
            <Image 
              // La KEY deve essere unica per lo shift e l'URL
              key={`img_${item.id}_${item.image_url}`}
              source={imageSource} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            // Placeholder se non c'è immagine
            <View style={styles.placeholder}>
              <Ionicons name="restaurant-outline" size={24} color={theme.icon} />
            </View>
          )}
        </View>

        {/* INFO TESTUALI */}
        <View style={styles.mainInfo}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.tint} />
              <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                {new Date(item.shift_date).toLocaleDateString("en-GB", { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color={theme.tint} />
              <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* ICONA DI NAVIGAZIONE */}
        <View style={styles.actionIcon}>
          <Ionicons 
            name={variant === "worker" ? "chevron-forward-circle" : "chevron-forward"} 
            size={variant === "worker" ? 26 : 20} 
            color={variant === "worker" ? theme.text : theme.icon + "60"} 
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    // Ombra sottile per profondità
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: "center",
    alignItems: "center",
  },
  mainInfo: { 
    flex: 1, 
    justifyContent: 'center'
  },
  title: { 
    fontSize: 16, 
    fontWeight: "700", 
    letterSpacing: -0.3,
    marginBottom: 4
  },
  detailsRow: { 
    flexDirection: "row", 
    gap: 8,
  },
  infoItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  infoText: { 
    fontSize: 11, 
    fontWeight: "600",
  },
  actionIcon: {
    paddingLeft: 4,
  }
});