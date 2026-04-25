import { useState, useMemo } from "react";
import { Platform } from "react-native";

export const useShiftForm = (initialData?: any) => {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    department: initialData?.department || "",
    industry: "hospitality",
    hourly_rate: initialData?.hourly_rate?.toString() || "",
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    startTime: initialData?.startTime ? new Date(initialData.startTime) : new Date(),
    endTime: initialData?.endTime ? new Date(initialData.endTime) : new Date(),
  });

  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

  const estimatedEarnings = useMemo(() => {
    const rate = parseFloat(form.hourly_rate);
    if (isNaN(rate) || rate <= 0) return "0.00";
    const diffInMs = form.endTime.getTime() - form.startTime.getTime();
    let diffInHours = diffInMs / (1000 * 60 * 60);
    if (diffInHours < 0) diffInHours += 24;
    return (rate * diffInHours).toFixed(2);
  }, [form.hourly_rate, form.startTime, form.endTime]);

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPicker(prev => ({ ...prev, show: false }));
    if (selectedDate) setForm(prev => ({ ...prev, [picker.target]: selectedDate }));
  };

  const openPicker = (mode: 'date' | 'time', target: string) => {
    setPicker({ show: true, mode, target: target as any });
  };

  return { form, setForm, picker, setPicker, estimatedEarnings, onPickerChange, openPicker };
};