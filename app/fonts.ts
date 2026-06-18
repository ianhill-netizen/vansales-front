import { Bricolage_Grotesque, Hanken_Grotesk, Geist_Mono } from "next/font/google";

/* Display — characterful grotesque, used with restraint for headlines + price */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

/* UI / body — clean, friendly grotesque for everything readable */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

/* Data — instrument-cluster mono for spec readouts, plates, reference codes */
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const fontVariables = `${bricolage.variable} ${hanken.variable} ${geistMono.variable}`;
