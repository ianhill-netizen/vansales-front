import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Display face for headings: tokens.css / globals.css reference --font-jakarta. Self-hosted by next/font (no render-blocking Google Fonts <link>).
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fontVariables = `${geist.variable} ${geistMono.variable} ${jakarta.variable}`;
