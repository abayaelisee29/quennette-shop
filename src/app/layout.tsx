import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/components/I18nProvider";
import { shop } from "@/lib/config";
import { getI18n } from "@/lib/i18n/server";
import { THEME_STORAGE_KEY, defaultTheme } from "@/lib/themes";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: `${shop.name} · ${t.meta.tagline}`, template: `%s · ${shop.name}` },
    description: t.meta.description,
  };
}

// Applique le thème enregistré avant l'affichage, pour éviter un flash de couleurs.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_STORAGE_KEY}")||"${defaultTheme}"}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getI18n();
  return (
    <html lang={lang} data-theme={defaultTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top" className="flex min-h-screen flex-col font-sans antialiased">
        <I18nProvider lang={lang} t={t}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
