import React from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

interface ShiftCardProps {
  item: any;
  onPress: () => void;
  variant?: "worker" | "manager" | "global";
  isApplied?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
}

export const ShiftCard = ({ 
  item, 
  onPress, 
  variant = "worker", 
  isApplied, 
  isPending,
  isRejected
}: ShiftCardProps) => {
  const theme = Colors.light;
  const imageSource = item.image_url ? { uri: `${item.image_url}` } : undefined;
  const dbStatus = item.status?.toLowerCase() || "open"; 

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card, 
        { 
          backgroundColor: theme.card, 
          opacity: pressed ? 0.9 : 1, 
          transform: [{ scale: pressed ? 0.97 : 1 }] 
        }
      ]}
    >
      {/* IMMAGINE E PREZZO */}
      <View style={[styles.imageWrapper, { backgroundColor: theme.background }]}>
        {item.image_url ? (
          <Image source={imageSource} style={styles.image} />
        ) : (
          <Ionicons name="apps-outline" size={30} color={theme.tint + "40"} />
        )}
        
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>€{Math.round(item.total_pay || 0)}</Text>
        </View>
      </View>

      {/* INFO CONTENUTO */}
      <View style={styles.infoContent}>
        <View>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          
          <View style={styles.row}>
            <Ionicons name="time-sharp" size={12} color={theme.tint} />
            <Text style={[styles.detailText, { color: theme.secondaryText }]}>
              {item.start_time?.slice(0, 5)}
            </Text>
            <View style={styles.dot} />
            <Text style={[styles.detailText, { color: theme.secondaryText }]}>
              {item.shift_date ? new Date(item.shift_date).toLocaleDateString("it-IT", { day: '2-digit', month: 'short' }) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* CARD FOOTER*/}
        <View style={styles.footer}>
          {/* Badge del Dipartimento */}
          <View style={[styles.deptBadge, { backgroundColor: theme.tint + "10" }]}>
            <Text style={[styles.deptText, { color: theme.tint }]}>
              {item.departments?.name || 'General'}
            </Text>
          </View>

          {/* ================= VIEW STILE WORKER ================= */}
          {variant === "worker" && (
            <View style={styles.statusContainer}>
              {isApplied && (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-done-circle" size={14} color="#10B981" />
                  <Text style={[styles.statusText, { color: '#10B981' }]}>Confirmed</Text>
                </View>
              )}
              {isPending && !isApplied && !isRejected && (
                <View style={styles.statusBadge}>
                  <Ionicons name="hourglass-outline" size={12} color="#D97706" />
                  <Text style={[styles.statusText, { color: '#D97706' }]}>Pending</Text>
                </View>
              )}
              {isRejected && !isApplied && (
                <View style={styles.statusBadge}>
                  <Ionicons name="close-circle-outline" size={13} color="#DC2626" />
                  <Text style={[styles.statusText, { color: '#DC2626' }]}>Rejected</Text>
                </View>
              )}
              {!isRejected && !isApplied && !isPending &&(
                <View style={styles.statusBadge}>
                  <Ionicons name="radio-button-on" size={13} color="#2647dcff" />
                  <Text style={[styles.statusText, { color: '#2647dcff' }]}>Open</Text>
                </View>
              )}
            </View>
          )}

          {/* ================= VIEW STILE MANAGER ================= */}
          {variant === "manager" && (
            <View style={styles.statusContainer}>
              {dbStatus === "completed" && (
                <View style={styles.statusBadge}>
                  <Ionicons name="archive-outline" size={13} color="#6B7280" />
                  <Text style={[styles.statusText, { color: '#6B7280' }]}>Completed</Text>
                </View>
              )}
              {(dbStatus === "filled" || dbStatus === "assigned") && (
                <View style={styles.statusBadge}>
                  <Ionicons name="people-outline" size={13} color="#10B981" />
                  <Text style={[styles.statusText, { color: '#10B981' }]}>Filled</Text>
                </View>
              )}
              {dbStatus === "open" && (
                <View style={styles.statusBadge}>
                  <Ionicons name="radio-button-on" size={12} color="#3B82F6" />
                  <Text style={[styles.statusText, { color: '#3B82F6' }]}>Open</Text>
                </View>
              )}
              {dbStatus === "canceled" && (
                <View style={styles.statusBadge}>
                  <Ionicons name="ban" size={12} color="#EF4444" />
                  <Text style={[styles.statusText, { color: '#EF4444' }]}>Canceled</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { 
    width: '47%', 
    aspectRatio: 0.82, // Leggermente aumentato per accomodare l'incolonnamento senza stringere i testi
    borderRadius: 28, 
    marginBottom: 15, 
    padding: 8, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    elevation: 3, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.03)' 
  },
  imageWrapper: { width: '100%', height: '52%', borderRadius: 22, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  priceTag: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  priceText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  infoContent: { flex: 1, paddingHorizontal: 6, paddingTop: 8, justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: -0.5, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 10, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D1D6' },
  
  // Modifica Layout Footer per incolonnare
  footer: { 
    flexDirection: 'column', 
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 'auto', 
    paddingBottom: 4 
  },
  deptBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  deptText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  statusContainer: {
    paddingLeft: 2 
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
});