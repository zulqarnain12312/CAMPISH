import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopifyClone - Your Ultimate E-commerce Destination",
  description: "Discover amazing products at unbeatable prices. Shop the latest trends in fashion, electronics, home & garden, and more.",
  keywords: "e-commerce, online shopping, fashion, electronics, home, garden, deals",
  authors: [{ name: "ShopifyClone Team" }],
  creator: "ShopifyClone",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shopifyclone.com",
    title: "ShopifyClone - Your Ultimate E-commerce Destination",
    description: "Discover amazing products at unbeatable prices. Shop the latest trends in fashion, electronics, home & garden, and more.",
    siteName: "ShopifyClone",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopifyClone - Your Ultimate E-commerce Destination",
    description: "Discover amazing products at unbeatable prices. Shop the latest trends in fashion, electronics, home & garden, and more.",
    creator: "@shopifyclone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
