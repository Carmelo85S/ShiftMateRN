import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  userName: string;
  theme: any;
  onProfilePress: () => void;
}

export const DashboardHeader = ({ userName, theme, onProfilePress }: Props) => {
  const formattedDate = new Date()
    .toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
    .toUpperCase();

  return (
    <View style={styles.topBar}>
      <View>
        <Text style={[styles.dateText, { color: theme.secondaryText }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.userName, { color: theme.text }]}>
          Hi, {userName.split(' ')[0]}
        </Text>
      </View>
      <Pressable 
        onPress={onProfilePress}
        style={[styles.profileButton, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Ionicons name="person" size={18} color={theme.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dateText: {fontSize: 10,fontWeight: "700",letterSpacing: 1.2,opacity: 0.5},
    userName: {fontSize: 28,fontWeight: "900",letterSpacing: -0.5,marginTop: 2 },
    profileButton: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
                    shadowRadius: 5, elevation: 2
    },
});