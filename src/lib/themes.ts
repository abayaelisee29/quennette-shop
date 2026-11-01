// Liste des thèmes. Les couleurs de chaque thème sont dans src/app/globals.css ([data-theme="..."]).
// Les noms affichés sont dans src/lib/i18n (t.themes).
// Pour ajouter un thème : ajoutez un bloc CSS et une entrée ici.
export const themes = [
  { id: "reine", swatch: ["#3b1f4a", "#e0a526"] },
  { id: "ocean", swatch: ["#0f4c5c", "#ff7a59"] },
  { id: "foret", swatch: ["#1f3d2b", "#c9a227"] },
  { id: "minuit", swatch: ["#0b0f19", "#8b7cf6"] },
  { id: "kente", swatch: ["#0d3b2a", "#f2b705"] },
  { id: "ivoire", swatch: ["#111111", "#b08d57"] },
  { id: "lagune", swatch: ["#0aa3a3", "#ff6f59"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
export const defaultTheme: ThemeId = "reine";
export const THEME_STORAGE_KEY = "queennette-theme";
