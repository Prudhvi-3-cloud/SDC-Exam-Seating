import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import PortalRedirectGuard from "@/components/layout/PortalRedirectGuard";

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Merriweather({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SRIT Exam Seating Arrangement",
  description: "Prototype for SRIT exam seating plans and room sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <PortalRedirectGuard />
        {children}
      </body>
    </html>
  );
}
