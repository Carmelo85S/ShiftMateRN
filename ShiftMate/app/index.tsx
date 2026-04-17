import { View, Text, Pressable, StyleSheet, ImageBackground, Dimensions, Platform } from "react-native";
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
        source={require("../assets/images/hero.webp")} 
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* INTERACTIVE CONTENT CARD */}
      <View style={[styles.contentCard, { backgroundColor: theme.background }]}>
        <View style={styles.dragIndicator} />
        
        {/* TEXT SECTION */}
        <View style={styles.textSection}>
          <Text style={[styles.brandName, { color: theme.text }]}>ShiftMate</Text>
          <Text style={[styles.tagline, { color: theme.secondaryText }]}>
            Assign shifts or claim opportunities.{"\n"}
            Your unified workflow, simplified.
          </Text>
        </View>

        {/* BUTTON SECTION */}
        <View style={styles.buttonSection}>
          {/* ROW: SIGN IN & REGISTER */}
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [
                styles.halfBtn, 
                { backgroundColor: theme.text, opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={[styles.primaryBtnText, { color: theme.background }]}>
                Sign In
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.halfBtn, 
                { borderWidth: 1.5, borderColor: theme.border, opacity: pressed ? 0.6 : 1 }
              ]}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                Register
              </Text>
            </Pressable>
          </View>

          {/* GUEST VIEW BUTTON (FULL WIDTH) */}
          <Pressable
            style={({ pressed }) => [
              styles.fullGuestBtn, 
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => router.push("/(worker)/(tabs)/shifts")}
          >
            <Text style={[styles.guestBtnText, { color: theme.text }]}>
              Continue as Guest
            </Text>
          </Pressable>
        </View>

        {/* FOOTER NOTE - Pushed to bottom by marginTop: 'auto' */}
        <Text style={styles.footerNote}>© 2026 ShiftMate Operations Platform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  heroImage: { 
    width: '100%', 
    height: height * 0.58, 
  },
  contentCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.46, 
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#EBEBEB',
    borderRadius: 10,
    marginBottom: 25
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  brandName: { 
    fontSize: 36, 
    fontWeight: "900", 
    letterSpacing: -1.5,
    marginBottom: 10 
  },
  tagline: { 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24,
    fontWeight: "500",
    paddingHorizontal: 10
  },
  buttonSection: {
    width: '100%',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullGuestBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { 
    fontSize: 16, 
    fontWeight: "800" 
  },
  secondaryBtnText: { 
    fontSize: 16, 
    fontWeight: "700" 
  },
  guestBtnText: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  footerNote: {
    marginTop: 'auto',
    fontSize: 10,
    color: '#D1D1D1',
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingTop: 20
  }
});