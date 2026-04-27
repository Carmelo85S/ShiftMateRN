import React from "react";
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { Colors } from "@/constants/theme";
import { useSetupBusiness } from "@/hooks/manager/useSetupBusiness";
import { SetupHeader } from "@/components/manager/SetupHeader";
import { SetupInfoBox } from "@/components/manager/SetupInfoBox";
import { SetupInput } from "@/components/manager/SetupInput";
import { SetupButton } from "@/components/manager/SetupButton";

export default function SetupBusiness() {
  const theme = Colors.light;
  const { businessName, setBusinessName, loading, handleCreateBusiness } = useSetupBusiness();

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
});