import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterOptions() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper scrollable={false} style={styles.wrapper}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.centerSection}>
            <View style={styles.header}>
              <Text style={[styles.kpi, { color: theme.tint }]}>
                SECURE ACCESS
              </Text>
              <Text style={[styles.title, { color: theme.text }]}>
                How do you{"\n"}want to join?
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              <OptionCard
                title="Business Owner"
                description="Create your company and manage shifts."
                icon="business"
                onPress={() =>
                  router.push({
                    pathname: "/auth/register",
                    params: { role: "owner" },
                  })
                }
                theme={theme}
              />
              <OptionCard
                title="Team Member"
                description="Use your invite code to access your team."
                icon="people"
                onPress={() =>
                  router.push({
                    pathname: "/auth/register",
                    params: { role: "team" },
                  })
                }
                theme={theme}
              />
              <OptionCard
                title="Candidate"
                description="Apply for new job opportunities."
                icon="star"
                onPress={() =>
                  router.push({
                    pathname: "/auth/register",
                    params: { role: "candidate" },
                  })
                }
                theme={theme}
              />
            </View>
          </View>

          {/* FOOTER LINK */}
          <Pressable
            onPress={() => router.push("/auth/login")}
            style={styles.backLink}
          >
            <Text style={styles.backText}>
              Already have an account?{" "}
              <Text style={{ fontWeight: "900", color: theme.text }}>
                Login
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    </>
  );
}

const OptionCard = ({ title, description, icon, onPress, theme }: any) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={24} color={theme.text} />
    </View>
    <View style={styles.cardText}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </Pressable>
);

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  centerSection: { flex: 1, justifyContent: "center" },
  header: { marginBottom: 45 },
  kpi: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.8,
  },
  title: { fontSize: 38, fontWeight: "800", lineHeight: 42, letterSpacing: -1 },
  optionsContainer: { gap: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F1F3F5",
    borderRadius: 22,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1A1D1E" },
  cardDesc: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  backLink: { paddingBottom: 40, alignItems: "center" },
  backText: { fontSize: 15, color: "#8E8E93" },
});
