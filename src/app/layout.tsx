import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartWatt - Kerala Energy Estimator",
  description: "Professional energy consumption analysis tool for Kerala facilities",
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
        {children}
      </body>
    </html>
  );
}
