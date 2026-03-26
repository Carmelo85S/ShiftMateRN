import { Platform } from "react-native";

// Colori principali aggiornati
const tintColorLight = "#3B82F6"; // Blu moderno e brillante
const tintColorDark = "#0FF0FC";  // Neon azzurro acceso

export const Colors = {
  light: {
    text: "#1F2937",        // Testo principale grigio scuro elegante
    background: "#F3F4F6",  // Sfondo chiaro morbido, meno aggressivo
    tint: tintColorLight,    // Colore primario pulsanti e highlights
    delete: "#EF4444",       // Rosso brillante per delete
    icon: "#6B7280",         // Icone secondarie
    tabIconDefault: "#D1D5DB",  // Tab non selezionata
    tabIconSelected: tintColorLight, // Tab selezionata
    card: "#FFFFFF",         // Card chiara
  },
  dark: {
    text: "#E5E7EB",         // Testo chiaro, leggibile su scuro
    background: "#1F2937",   // Sfondo scuro elegante
    tint: tintColorDark,     // Colore primario neon
    delete: "#F87171",       // Rosso delete leggermente più soft
    icon: "#9CA3AF",         // Icone secondarie
    tabIconDefault: "#6B7280",  // Tab non selezionata
    tabIconSelected: tintColorDark,  // Tab selezionata
    card: "#111827",         // Card scura
  },
};

// Fonts aggiornati con fallback web coerente
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});