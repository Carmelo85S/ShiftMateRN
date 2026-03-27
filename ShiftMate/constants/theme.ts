import { Platform } from "react-native";

// Colori principali aggiornati
const tintColorLight = "#3B82F6"; // Blu moderno e brillante
const tintColorDark = "#0FF0FC";  // Neon azzurro acceso

export const Colors = {
  light: {
    text: "#1F2937",        // Testo principale grigio scuro elegante
    background: "#F3F4F6",  // Sfondo chiaro morbido
    tint: tintColorLight,    // Colore primario
    delete: "#EF4444",       // Rosso brillante
    icon: "#6B7280",         // Icone secondarie
    tabIconDefault: "#D1D5DB",  
    tabIconSelected: tintColorLight, 
    card: "#FFFFFF",         // Card chiara
    border: "#E5E7EB",       // <--- Grigio chiarissimo per bordi e divider (Light)
  },
  dark: {
    text: "#E5E7EB",         
    background: "#1F2937",   
    tint: tintColorDark,     
    delete: "#F87171",       
    icon: "#9CA3AF",         
    tabIconDefault: "#6B7280",  
    tabIconSelected: tintColorDark,  
    card: "#111827",         
    border: "#374151",       // <--- Grigio scuro/bluastro per bordi (Dark)
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