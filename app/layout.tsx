import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Xtreme Auto Builder — Autonomous AI Business OS",
    template: "%s | Xtreme Auto Builder",
  },
  description:
    "Xtreme Auto Builder (XAB) — the autonomous AI business operating system combining live AI chat, agents, workflows, CRM, knowledge, and automation in one unified platform.",
  keywords: ["AI agents", "workflow automation", "CRM", "business OS", "AI chat", "Xtreme Auto Builder", "XAB"],
  authors: [{ name: "Xtreme Auto Builder" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Xtreme Auto Builder",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} bg-[var(--color-background)]`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
