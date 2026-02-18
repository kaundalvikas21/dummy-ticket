import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/contexts/locale-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { CurrencyLoadingOverlay } from "@/components/ui/currency-loading-overlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "VisaFly | Flight Reservations for Visa Applications",
  description:
    "Secure verifiable flight reservations for visa applications in minutes. Trusted by 50,000+ travelers worldwide, we provide reliable dummy tickets and flight itineraries to simplify your visa approval process.",
  keywords:
    "dummy ticket, flight reservation, visa application, travel booking, PNR code",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "VisaFly" }],
  publisher: "VisaFly",

  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <LocaleProvider>
          <CurrencyProvider>
            <CurrencyLoadingOverlay />
            <AuthProvider>
              {children}
            </AuthProvider>
          </CurrencyProvider>
        </LocaleProvider>
        <Toaster />
        <ScrollToTop />
      </body>
    </html>
  );
}
