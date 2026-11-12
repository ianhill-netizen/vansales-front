import localFont from "next/font/local";

// Self-hosted variable fonts (SIL OFL 1.1, see app/fonts/LICENSE-*.txt), latin subset, from the @fontsource-variable packages.
// No network request at build or run time. Never reintroduce the Google font loader (guarded by lib/fonts-selfhosted.test.ts).
export const geist = localFont({
  src: "./fonts/geist-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = localFont({
  src: "./fonts/geist-mono-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

// Display face for headings: tokens.css / globals.css reference --font-jakarta.
export const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-jakarta",
  display: "swap",
});

export const fontVariables = `${geist.variable} ${geistMono.variable} ${jakarta.variable}`;
