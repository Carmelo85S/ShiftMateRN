import { Platform } from "react-native";

// Palette Unificata: Non cambierà mai, garantendo un look professionale
const BRAND_PRIMARY = "#3B82F6"; // Il tuo blu moderno
const BRAND_DANGER = "#EF4444";  // Rosso per azioni distruttive
const NEUTRAL_900 = "#111827";   // Quasi nero per i titoli
const NEUTRAL_600 = "#4B5563";   // Grigio per testi secondari
const NEUTRAL_100 = "#F3F4F6";   // Sfondo app
const WHITE = "#FFFFFF";         // Sfondo card

const UnifiedPalette = {
  text: NEUTRAL_900,
  secondaryText: NEUTRAL_600,
  background: NEUTRAL_100,
  tint: BRAND_PRIMARY,
  delete: BRAND_DANGER,
  icon: "#6B7280",
  tabIconDefault: "#9CA3AF",
  tabIconSelected: BRAND_PRIMARY,
  card: WHITE,
  border: "#E5E7EB",
  success: "#10B981",
};

export const Colors = {
  light: UnifiedPalette,
  dark: UnifiedPalette,
};

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    rounded: "SF Pro Rounded",
    mono: "Menlo",
  },
  android: {
    sans: "sans-serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, sans-serif",
    rounded: "ui-rounded, 'SF Pro Rounded', sans-serif",
    mono: "ui-monospace, monospace",
  },
});