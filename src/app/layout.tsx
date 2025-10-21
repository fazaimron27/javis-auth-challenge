import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

/**
 * Font configuration for Geist Sans
 * Sets up the main font family used throughout the application
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Font configuration for Geist Mono
 * Sets up the monospace font family for code blocks and technical content
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application metadata
 * Defines the default title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: "Login - Dashboard",
  description: "Login to your dashboard",
};

/**
 * Root layout component
 * Wraps all pages in the application with:
 * 1. HTML and body structure
 * 2. Font configuration
 * 3. Theme provider for dark/light mode support
 * 
 * @param children The page content to be rendered inside the layout
 * @returns The complete HTML structure with applied global settings
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
