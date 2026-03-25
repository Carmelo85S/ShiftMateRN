import { Platform } from "react-native";

// Colori principali
const tintColorLight = "#1E90FF"; // Blu brillante
const tintColorDark = "#0FF0FC";  // Neon azzurro

export const Colors = {
  light: {
    text: "#1C1C1C",        // Testo principale
    background: "#FAFAFA",  // Sfondo chiaro morbido
    tint: tintColorLight,    // Colore primario
    delete: "#FF4C4C",       // Rosso per delete
    icon: "#555",            // Icone secondarie
    tabIconDefault: "#AAA",  // Tab non selezionata
    tabIconSelected: tintColorLight, // Tab selezionata
    card: "#FFFFFF",         // Card
  },
  dark: {
    text: "#E0E0E0",         // Testo principale chiaro
    background: "#121212",   // Sfondo scuro
    tint: tintColorDark,     // Colore primario neon
    delete: "#FF4C4C",       // Rosso delete
    icon: "#888",            // Icone secondarie
    tabIconDefault: "#555",  // Tab non selezionata
    tabIconSelected: tintColorDark,  // Tab selezionata
    card: "#1E1E1E",         // Card scura
  },
};

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