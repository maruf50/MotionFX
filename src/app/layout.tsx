import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MotionFX Studio — Motion Graphics Creator',
  description: 'Create trendy motion graphics, shapes with round/dotted borders, kinetic text, PNG stickers, keyframe animations, and export videos in Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}>
      <body className="h-screen w-screen overflow-hidden flex flex-col bg-[#090a0f] text-slate-100">
        {children}
      </body>
    </html>
  );
}
