import React from "react";
import { 
  Text, 
  Pressable, 
  ActivityIndicator, 
  StyleSheet, 
  View 
} from "react-native";

interface SaveButtonProps {
  onPress: () => void;
  saving: boolean;
  theme: any;
  title?: string;
}

export const SaveButton = ({ 
  onPress, 
  saving, 
  theme, 
  title = "SAVE CHANGES" 
}: SaveButtonProps) => {
  return (
    <View style={styles.footer}>
      <Pressable
        onPress={onPress}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveButton,
          { 
            backgroundColor: theme.text, 
            opacity: (pressed || saving) ? 0.8 : 1 
          }
        ]}
      >
        {saving ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.saveButtonText, { color: theme.background }]}>
            {title}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: { 
    marginTop: 40 
  },
  saveButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { 
    fontSize: 16, 
    fontWeight: "900", 
    letterSpacing: 1 
  },
});