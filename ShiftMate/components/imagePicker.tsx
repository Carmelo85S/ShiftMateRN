// components/AvatarPicker.tsx
import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: string | null;
  onChange: (uri: string) => void;
};

export default function AvatarPicker({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access media library is required.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // usa solo immagini
      allowsEditing: true,
      aspect: [1, 1], // quadrato
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setLoading(true);
      const uploadedUrl = await uploadAvatar(uri);
      setLoading(false);
      if (uploadedUrl) onChange(uploadedUrl);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      // legge il file come base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const filePath = `${userData.user.id}/avatar.jpg`;

      // upload in Supabase Storage
      const { error } = await supabase.storage
        .from("files")
        .upload(filePath, base64, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      // ottieni URL pubblico
      const { data: urlData } = supabase.storage
        .from("files")
        .getPublicUrl(filePath);

      console.log("Uploaded path:", filePath);
      console.log("Public URL:", urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to upload avatar. Check storage policies!");
      return null;
    }
  };

  return (
    <Pressable style={styles.container} onPress={pickImage}>
      {loading ? (
        <Text style={styles.loadingText}>Uploading...</Text>
      ) : value ? (
        <Image source={{ uri: value }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Pick Avatar</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 12 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#aaa",
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#aaa",
  },
  placeholderText: { color: "#888" },
  loadingText: { color: "#888" },
});
