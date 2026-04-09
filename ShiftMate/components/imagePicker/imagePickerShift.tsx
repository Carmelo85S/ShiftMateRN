import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";

type ShiftUploaderProps = {
  initialUrl?: string | null;
  onUpload: (url: string) => void;
};

export default function ShiftUploader({ initialUrl, onUpload }: ShiftUploaderProps) {
  const [image, setImage] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permesso negato", "È necessario l'accesso alla galleria per caricare una foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9], // Ratio più adatto per le card dei turni
      quality: 0.7,    // Ridotto leggermente per caricamenti più veloci
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      
      setUploading(true);
      const uploadedUrl = await uploadShift(uri);
      setUploading(false);

      if (uploadedUrl) {
        onUpload(uploadedUrl);
      } else {
        Alert.alert("Errore", "Impossibile caricare l'immagine. Riprova.");
      }
    }
  };

  const uploadShift = async (uri: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const fileExt = uri.split(".").pop();
      
      // CORREZIONE CRITICA: Generiamo un nome file UNICO per ogni upload
      // Struttura: id_utente/timestamp_stringacasuale.estensione
      const uniquePath = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const fileName = `${userData.user.id}/${uniquePath}.${fileExt}`;

      // Preparazione FormData per il Bucket di Supabase
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      } as any);

      // Upload su Supabase Storage
      const { data, error } = await supabase.storage
        .from("shift")
        .upload(fileName, formData, { 
          cacheControl: '3600',
          upsert: false // Non sovrascrivere mai i file esistenti
        });

      if (error) {
        console.error("Supabase storage error:", error);
        return null;
      }

      // Otteniamo l'URL pubblico definitivo
      const { data: publicData } = supabase.storage
        .from("shift")
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (err) {
      console.error("Upload process error:", err);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.imagePicker, uploading && { opacity: 0.6 }]} 
        onPress={pickImage}
        disabled={uploading}
      >
        {image ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            {uploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="image-outline" size={32} color={"#39E467"} />
            </View>
            <Text style={styles.placeholderText}>Aggiungi una foto al turno</Text>
            <Text style={styles.placeholderSubtext}>Trascina o seleziona dalla galleria</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    alignItems: "center" 
  },
  imagePicker: {
    width: "100%",         
    height: 180,       
    borderRadius: 24,   
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 12,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#39E46715',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  placeholderSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});