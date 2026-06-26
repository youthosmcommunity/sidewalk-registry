import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sidewalk Registry",
  description:
    "A normalized, browsable, downloadable registry of Canada's pedestrian infrastructure data -- built on Statistics Canada's Canadian Pedestrian Network Database.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col">
        <header className="flex items-center gap-6 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
          <Link href="/" className="font-semibold">
            Sidewalk Registry
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/catalog" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Catalog
            </Link>
            <Link href="/download" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Download
            </Link>
          </nav>
        </header>
        <main className="min-h-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
