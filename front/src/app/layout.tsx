import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Darba — AI Studio",
    template: "%s | Darba",
  },
  description: "Все AI-инструменты в одном месте: чат, генерация изображений, аудио, видео и липсинк",
  metadataBase: new URL("https://darba.pro"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://darba.pro",
    siteName: "Darba",
    title: "Darba — AI Studio",
    description: "Все AI-инструменты в одном месте: чат, генерация изображений, аудио, видео и липсинк",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Darba AI Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Darba — AI Studio",
    description: "Все AI-инструменты в одном месте",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={cn(inter.variable, "font-sans antialiased bg-background text-foreground")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
