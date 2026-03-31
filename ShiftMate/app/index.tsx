import { View, Text, Pressable, StyleSheet, ImageBackground, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";

const { height } = Dimensions.get("window");

export default function AuthChoice() {
  const theme = Colors.light;
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar style="light" />
      
      {/* HERO IMAGE SECTION */}
      <ImageBackground 
        source={require("../assets/images/heroImage.png")} 
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* INTERACTIVE CONTENT CARD */}
      <View style={[styles.contentCard, { backgroundColor: theme.background }]}>
        <View style={styles.dragIndicator} />
        
        <View style={styles.textSection}>
          <Text style={[styles.brandName, { color: theme.text }]}>ShiftMate</Text>
          <Text style={[styles.tagline, { color: theme.secondaryText }]}>
            Streamline scheduling, assign shifts, and claim opportunities. Your unified workflow, simplified.
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: theme.text }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={[styles.primaryBtnText, { color: theme.background }]}>
              Sign In
            </Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
            onPress={() => router.push("/auth/register")}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
              Create Account
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>© 2026 ShitMate Operations Platform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: { 
    width: '100%', 
    height: height * 0.6, 
  },
  contentCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.48, 
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 30,
    alignItems: 'center',
    // Elevation for the "floating card" effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    marginBottom: 25
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  brandName: { 
    fontSize: 34, 
    fontWeight: "900", 
    letterSpacing: -1,
    marginBottom: 12 
  },
  tagline: { 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24,
    fontWeight: "500",
    paddingHorizontal: 15
  },
  buttonSection: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  secondaryBtn: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "700" },
  footerNote: {
    marginTop: 30,
    fontSize: 11,
    color: '#CCCCCC',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});