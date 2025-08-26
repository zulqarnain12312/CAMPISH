import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CAMPISH - Modern E-commerce Platform",
  description: "Your one-stop destination for premium products. Shop the latest trends with unbeatable prices and exceptional customer service.",
  keywords: "e-commerce, online shopping, premium products, fashion, electronics, home & garden",
  authors: [{ name: "CAMPISH Team" }],
  openGraph: {
    title: "CAMPISH - Modern E-commerce Platform",
    description: "Your one-stop destination for premium products",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAMPISH - Modern E-commerce Platform",
    description: "Your one-stop destination for premium products",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
