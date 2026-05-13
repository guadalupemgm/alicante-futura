import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/context/ThemeContext";

export const metadata: Metadata = {
  title: "Bookings Admin",
  description: "Base inicial del proyecto de gestión de reservas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}