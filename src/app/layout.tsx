import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/layout/navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ItemCheck AI',
  description: 'AI-powered listing analysis for smarter, safer buying decisions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-6 px-4 md:px-6 border-t border-border mt-auto bg-background">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ItemCheck AI. All rights reserved.
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
