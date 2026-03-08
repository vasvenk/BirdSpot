import type { Metadata, Viewport } from "next";

import { BottomTabBar } from "@/components/BottomTabBar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Providers } from "@/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://birdspot.app"),
  title: {
    default: "BirdSpot",
    template: "%s · BirdSpot",
  },
  description: "BirdSpot is a mobile-first PWA for sharing bird sightings with photos, maps, and threaded discussion.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BirdSpot",
  },
  icons: {
    apple: "/icons/icon-192.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4A7C59",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-[-12%] top-[-8%] h-72 w-72 rounded-full bg-[color:var(--color-moss)]/18 blur-3xl" />
            <div className="absolute bottom-[15%] right-[-10%] h-80 w-80 rounded-full bg-[color:var(--color-sand)]/35 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),transparent_45%),linear-gradient(180deg,#f7fbf2_0%,#fdfcf6_48%,#f5f1e8_100%)]" />
          </div>

          <main className="mx-auto min-h-screen w-full max-w-xl px-4 pb-28 pt-5">{children}</main>
          <FloatingActionButton />
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  );
}
