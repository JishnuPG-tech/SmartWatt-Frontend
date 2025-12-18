import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartWatt - Kerala Energy Estimator",
  description: "Professional energy consumption analysis tool for Kerala facilities",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased font-sans`}
      >
        <div className="app-wrapper">
          {children}
          <Toaster position="top-center" richColors theme="dark" />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
