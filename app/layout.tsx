import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Soundmarks",
    template: "%s | Soundmarks",
  },
  description:
    "聴いたアルバムを評価し、感想やお気に入りを記録する音楽レビューアプリ",
  applicationName: "Soundmarks",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soundmarks",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
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
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}