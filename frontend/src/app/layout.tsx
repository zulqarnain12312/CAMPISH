import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "CAMPISH - Premium E-commerce Store",
  description: "Discover quality products at great prices. Shop the latest trends in fashion, electronics, home & garden, and more.",
  keywords: "e-commerce, online shopping, fashion, electronics, home, garden, premium products",
  authors: [{ name: "CAMPISH Team" }],
  creator: "CAMPISH",
  publisher: "CAMPISH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://campish.com'),
  openGraph: {
    title: "CAMPISH - Premium E-commerce Store",
    description: "Discover quality products at great prices. Shop the latest trends in fashion, electronics, home & garden, and more.",
    url: "https://campish.com",
    siteName: "CAMPISH",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CAMPISH - Premium E-commerce Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAMPISH - Premium E-commerce Store",
    description: "Discover quality products at great prices. Shop the latest trends in fashion, electronics, home & garden, and more.",
    images: ["/images/og-image.jpg"],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
