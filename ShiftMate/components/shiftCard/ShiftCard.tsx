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
    total_pay?: number; 
    hourly_rate?: number;
    department?: string;
  };
  onPress: () => void;
  variant?: "manager" | "worker";
}

export const ShiftCard = ({ item, onPress, variant = "manager" }: ShiftCardProps) => {
  const theme = Colors.light;

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
              key={`img_${item.id}_${item.image_url}`}
              source={imageSource} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons 
                name={item.department === 'logistics' ? 'bus-outline' : 'briefcase-outline'} 
                size={24} 
                color={theme.icon} 
              />
            </View>
          )}
        </View>

        {/* INFO */}
        <View style={styles.mainInfo}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {/* BADGE DIPARTIMENTO (Open App style) */}
            {item.department && (
              <View style={[styles.deptBadge, { backgroundColor: theme.tint + "15" }]}>
                <Text style={[styles.deptText, { color: theme.tint }]}>
                  {item.department.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={13} color={theme.tint} />
              <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                {new Date(item.shift_date).toLocaleDateString("en-GB", { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={13} color={theme.tint} />
              <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* PRICE / EARNINGS SECTION (La "Win" per il worker) */}
        <View style={styles.priceContainer}>
           <Text style={[styles.priceValue, { color: '#4CAF50' }]}>
             €{item.total_pay ? item.total_pay.toFixed(2) : "0.00"}
           </Text>
           <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>
             €{item.hourly_rate}/hr
           </Text>
        </View>

        <View style={styles.actionIcon}>
          <Ionicons 
            name="chevron-forward" 
            size={18} 
            color={theme.icon + "60"} 
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
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
  },
  headerRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: { 
    fontSize: 16, 
    fontWeight: "800", 
    letterSpacing: -0.5,
  },
  deptBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  deptText: {
    fontSize: 9,
    fontWeight: "800",
  },
  detailsRow: { 
    flexDirection: "row", 
    gap: 6,
  },
  infoItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 3,
  },
  infoText: { 
    fontSize: 12, 
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
    marginLeft: 10,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: -2,
  },
  actionIcon: {
    marginLeft: 8,
  }
});