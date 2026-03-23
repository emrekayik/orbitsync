import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Sans_3, Noto_Serif } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "orbitbase",
  description: "Your snippets, everywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        sourceSans3.variable,
        notoSerif.variable,
      )}
      suppressHydrationWarning
    >

      <body className="min-h-full flex flex-col bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
