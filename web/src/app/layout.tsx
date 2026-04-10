import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes"; // 👈 Importamos o provedor

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LabControl",
  description: "Sistema de Gerenciamento de Laboratórios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // O suppressHydrationWarning é necessário para o next-themes funcionar sem erros no console
    <html lang="pt-BR" suppressHydrationWarning> 
      <body className={inter.className}>
        {/* 👈 Definimos o defaultTheme como "dark" como você pediu! */}
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}