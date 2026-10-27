import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridiano — Economia, mercados e informação",
  description:
    "Notícias de economia e mercados reunidas de diversos veículos, sempre com crédito e link para a fonte original.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
