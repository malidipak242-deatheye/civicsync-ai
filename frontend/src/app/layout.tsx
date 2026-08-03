import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicSync AI | Smart Civic Issue Reporting — Amalner",
  description: "AI-Powered platform for reporting and managing civic issues like potholes, garbage, and street lights in Amalner Municipal Council. Report in 30 seconds.",
  keywords: ["civic issues", "pothole", "garbage", "Amalner", "municipal", "complaint", "AI"],
  openGraph: {
    title: "CivicSync AI — Smart Civic Reporting",
    description: "Report civic issues in under 30 seconds. AI-powered classification.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" }
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden min-h-screen flex flex-col`}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
