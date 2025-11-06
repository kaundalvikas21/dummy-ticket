import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/contexts/locale-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster"; 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "VisaFly | Flight Reservations for Visa Applications",
  description:
    "Get verifiable flight reservations for visa applications in minutes. Trusted by 50,000+ travelers worldwide.",
  keywords:
    "dummy ticket, flight reservation, visa application, travel booking, PNR code",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LocaleProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocaleProvider>
        <Toaster />
      </body>
    </html>
  );
}
