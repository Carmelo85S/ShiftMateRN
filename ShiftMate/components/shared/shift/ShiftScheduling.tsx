import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface Props {
  openPicker: (mode: 'date' | 'time', target: 'date' | 'startTime' | 'endTime') => void;
  form: {
    date: Date;
    startTime: Date;
    endTime: Date;
  };
  theme: any;
}

export const ShiftScheduling = ({ openPicker, form, theme }: Props) => {
  return (
    <View style={styles.row}>
      {/* DATE */}
      <View style={{ flex: 1.5 }}>
        <Text style={[styles.label, { color: theme.text }]}>Date</Text>
        <Pressable 
          onPress={() => openPicker('date', 'date')}
          style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text }}>
            {form.date.toLocaleDateString('en-GB')}
          </Text>
        </Pressable>
      </View>

      {/* START TIME */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: theme.text }]}>Start</Text>
        <Pressable 
          onPress={() => openPicker('time', 'startTime')}
          style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>
            {form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Pressable>
      </View>

      {/* END TIME */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: theme.text }]}>End</Text>
        <Pressable 
          onPress={() => openPicker('time', 'endTime')}
          style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>
            {form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { 
    flexDirection: "row", 
    gap: 10, 
    marginBottom: 25 
  },
  label: { 
    fontSize: 11, 
    fontWeight: "800", 
    marginBottom: 12, 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    opacity: 0.6 
  },
  input: { 
    height: 60, 
    borderRadius: 20, 
    borderWidth: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  pickerButton: { 
    paddingHorizontal: 4 
  },
});