import React from "react";
import { View, Text, Pressable, Modal, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  picker: {
    show: boolean;
    mode: 'date' | 'time';
    target: string;
  };
  form: any;
  onClose: () => void;
  onChange: (event: any, selectedDate?: Date) => void;
  theme: any;
}

export const ShiftDatePickerModal = ({ picker, form, onClose, onChange, theme }: Props) => {
  if (!picker.show) return null;

  return (
    <Modal transparent animationType="fade" visible={picker.show}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 16 }}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={form[picker.target] || new Date()}
            mode={picker.mode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
            textColor={theme.text}
            style={{ width: '100%', height: 250 }}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, alignItems: 'center' },
  modalHeader: { width: '100%', height: 60, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 25 },
});