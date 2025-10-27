import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Dummy Tickets for Visa Applications | Flight Reservations",
  description:
    "Get verifiable flight reservations for visa applications in minutes. Trusted by 50,000+ travelers worldwide. Fast, reliable, and accepted by embassies.",
  keywords:
    "dummy ticket, flight reservation, visa application, travel booking, PNR code",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
