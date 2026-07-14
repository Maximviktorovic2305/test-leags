import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { APP_URL } from "@/shared/config";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Climb League — соревнования по скалолазанию",
    template: "%s | Climb League",
  },
  description:
    "Проходите трассы, набирайте очки, следите за рейтингом и переходите из Зелёной лиги в Синюю.",
  applicationName: "Climb League",
  keywords: [
    "скалолазание",
    "трассы",
    "лидерборд",
    "соревнования",
    "Climb League",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Climb League",
    title: "Climb League — каждая трасса меняет расклад",
    description:
      "Проходите трассы, набирайте очки и поднимайтесь в рейтинге лиги.",
  },
  twitter: {
    card: "summary",
    title: "Climb League",
    description: "Трассы, очки и движение между лигами.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={geistSans.variable}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
