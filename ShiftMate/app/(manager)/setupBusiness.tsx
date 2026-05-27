import React from "react";
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Pressable,
  Text 
} from "react-native";
import { Colors } from "@/constants/theme";
import { useSetupBusiness } from "@/hooks/manager/useSetupBusiness";
import { SetupHeader } from "@/components/manager/setup-business/SetupHeader";
import { SetupInfoBox } from "@/components/manager/setup-business/SetupInfoBox";
import { SetupInput } from "@/components/manager/setup-business/SetupInput";
import { SetupButton } from "@/components/manager/setup-business/SetupButton";
import { Ionicons } from "@expo/vector-icons";

export default function SetupBusiness() {
  const theme = Colors.light;
  
  const { 
    businessName, 
    setBusinessName, 
    businessAddress, 
    setBusinessAddress, 
    businessCity, 
    setBusinessCity, 
    businessType,     
    setBusinessType,  
    loading, 
    handleCreateBusiness 
  } = useSetupBusiness();

  // 🌟 Condizione per capire se mostrare la geolocalizzazione fissa della struttura
  const showAddressFields = businessType === "standard";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <SetupHeader 
          kpi="FIRST STEP" 
          title={"Setup Your\nBusiness"} 
          theme={theme} 
        />

        <View style={styles.content}>
          <SetupInfoBox 
            icon="business-outline" 
            text="Register your business and start managing your team." 
            theme={theme}
          />

          <SetupInput 
            label="BUSINESS NAME"
            placeholder="e.g. Grand Hotel or Central Bar"
            value={businessName}
            onChangeText={setBusinessName}
            theme={theme}
          />

          {/* STANDARD VS STAFFING */}
          <View style={styles.typeWrapper}>
            <Text style={[styles.typeLabel, { color: theme.text }]}>BUSINESS MODEL</Text>
            <View style={styles.cardContainer}>
              
              {/* CARD STANDARD */}
              <Pressable 
                onPress={() => setBusinessType("standard")}
                style={[
                  styles.typeCard, 
                  { 
                    borderColor: businessType === "standard" ? theme.text : "rgba(0,0,0,0.06)",
                    borderWidth: businessType === "standard" ? 2 : 1 
                  }
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: businessType === "standard" ? theme.text : "#F1F3F5" }]}>
                  <Ionicons name="business" size={20} color={businessType === "standard" ? theme.background : theme.text} />
                </View>
                <View style={styles.cardTextContent}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Single Venue</Text>
                  <Text style={[styles.cardSubtitle, { color: theme.text }]}>For restaurants, hotels, bars or local shops.</Text>
                </View>
              </Pressable>

              {/* CARD STAFFING AGENCY */}
              <Pressable 
                onPress={() => setBusinessType("staffing")}
                style={[
                  styles.typeCard, 
                  { 
                    borderColor: businessType === "staffing" ? theme.tint : "rgba(0,0,0,0.06)",
                    borderWidth: businessType === "staffing" ? 2 : 1 
                  }
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: businessType === "staffing" ? theme.tint : "#F1F3F5" }]}>
                  <Ionicons name="people" size={20} color={businessType === "staffing" ? "#FFF" : theme.text} />
                </View>
                <View style={styles.cardTextContent}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Staffing Agency</Text>
                  <Text style={[styles.cardSubtitle, { color: theme.text }]}>For agencies hiring workers across multiple client locations.</Text>
                </View>
              </Pressable>

            </View>
          </View>

          {/* 🌟 CAMPI DINAMICI: Vengono renderizzati solo se la struttura è Standard (Ristoranti/Hotel) */}
          {showAddressFields && (
            <>
              <SetupInput 
                label="BUSINESS CITY"
                placeholder="e.g. Stockholm"
                value={businessCity}
                onChangeText={setBusinessCity}
                theme={theme}
              />

              <SetupInput 
                label="BUSINESS ADDRESS"
                placeholder="e.g. Ostermalm 123"
                value={businessAddress}
                onChangeText={setBusinessAddress}
                theme={theme}
              />
            </>
          )}

          <SetupButton 
            title="CREATE BUSINESS"
            onPress={handleCreateBusiness}
            loading={loading}
            icon="checkmark-circle"
            theme={theme}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40 },
  content: { gap: 30 },
  typeWrapper: { gap: 10 },
  typeLabel: { fontSize: 14, fontWeight: "600", marginLeft: 4, opacity: 0.7 },
  cardContainer: { gap: 12 },
  typeCard: { flexDirection: "row", padding: 16, borderRadius: 20, backgroundColor: "#F1F3F5", alignItems: "center", gap: 16 },
  iconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  cardTextContent: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardSubtitle: { fontSize: 11, opacity: 0.5, lineHeight: 14 }
});