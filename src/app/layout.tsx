import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { shop } from "@/lib/config";
import { THEME_STORAGE_KEY, defaultTheme } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${shop.name} · ${shop.tagline}`, template: `%s · ${shop.name}` },
  description: "Marketplace en ligne : électronique, maison, mode, beauté, sport, livres et jouets.",
};

// Applique le thème enregistré avant l'affichage, pour éviter un flash de couleurs.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_STORAGE_KEY}")||"${defaultTheme}"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme={defaultTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top" className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
