import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "@/lib/supabase";

type ShiftUploaderProps = {
  initialUrl?: string | null;
  onUpload: (url: string) => void;
};

export default function ShiftUploader({ initialUrl, onUpload }: ShiftUploaderProps) {
  const [image, setImage] = useState<string | null>(initialUrl ?? null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access the media library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      const uploadedUrl = await uploadShift(uri);
      if (uploadedUrl) onUpload(uploadedUrl);
    }
  };

const uploadShift = async (uri: string) => {
  try {
    const userData = await supabase.auth.getUser();
    if (!userData.data.user) return null;

    const fileExt = uri.split(".").pop();
    const fileName = `${userData.data.user.id}.${fileExt}`;

    // Crea FormData
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: `image/${fileExt}`,
    } as any);

    // Supabase Storage upload
    const { data, error } = await supabase.storage
      .from("shift")
      .upload(fileName, formData, { upsert: true });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("shift")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (err) {
    console.error(err);
    return null;
  }
};

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={40} color={"#39E467"} />
            <Text style={styles.placeholderText}>Pick an image</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },

  imagePicker: {
    width: 320,         
    height: 200,       
    borderRadius: 16,   
    borderWidth: 2,
    borderColor: "#aaa",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#fcfcfc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16, // deve combaciare con imagePicker
  },

  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },

  placeholderText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
});