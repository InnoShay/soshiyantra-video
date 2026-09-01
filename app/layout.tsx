import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sociantra AI Video Studio",
  description: "Convert an idea into a directed short-form AI video.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50 antialiased selection:bg-indigo-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
