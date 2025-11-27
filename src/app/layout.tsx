import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartWatt - Kerala Energy Estimator",
  description: "Professional energy consumption analysis tool for Kerala facilities",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased font-sans`}
      >
        <div className="app-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
