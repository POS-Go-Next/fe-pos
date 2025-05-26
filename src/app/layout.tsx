// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Ganti dengan Google Fonts
import "./globals.css";

// Gunakan Google Fonts sebagai alternatif
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apotek Roxy",
  description: "Apotek Roxy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
