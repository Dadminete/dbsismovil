import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DBSISMOVIL",
  description: "Gestión de clientes y facturas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DBSISMOVIL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen pb-24`} suppressHydrationWarning>
        <main className="max-w-lg mx-auto px-4 pt-8">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}
