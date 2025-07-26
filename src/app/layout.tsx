import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
      title: "Hyperdome - Professional Car Wash Services",
    description: "Book your professional car wash service with Hyperdome. From basic wash to full detailing, we provide premium car care services.",
  icons: {
    icon: [
      { url: '/sparklesLogo.png', type: 'image/png' },
      { url: '/sparklesLogo.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/sparklesLogo.png',
    apple: '/sparklesLogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
