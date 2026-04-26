import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface CandidatesCardProps {
  shiftId: string;
  applications: any[];
  theme: any;
}

export const CandidatesCard = ({ shiftId, applications, theme }: CandidatesCardProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Candidates</Text>
      
      <Pressable 
        onPress={() => router.push({ pathname: "/(manager)/shift-application/[id]", params: { id: shiftId } })}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <View style={styles.info}>
          <Text style={[styles.appsCount, { color: theme.tint }]}>
            {applications.length} applications to review
          </Text>
          
          <View style={styles.avatarRow}>
            {applications.slice(0, 4).map((app: any, index: number) => (
              <Image 
                key={app.id}
                source={app.profiles?.avatar_url ? { uri: app.profiles.avatar_url } : require("@/assets/images/icon.png")} 
                style={[
                  styles.avatar, 
                  { 
                    left: index * -12, // Crea l'effetto sovrapposizione
                    zIndex: 10 - index, 
                    borderColor: theme.card 
                  }
                ]} 
              />
            ))}
            
            {applications.length > 4 && (
              <View style={[
                styles.moreBadge, 
                { 
                  left: 4 * -12, 
                  backgroundColor: theme.text + "10", 
                  borderColor: theme.card 
                }
              ]}>
                <Text style={[styles.moreText, { color: theme.text }]}>
                  +{applications.length - 4}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={[styles.actionCircle, { backgroundColor: theme.tint }]}>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  info: {
    flex: 1,
  },
  appsCount: {
    fontSize: 15,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginLeft: 8, // Spazio per compensare l'offset negativo del primo avatar
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
  },
  moreBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  moreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});