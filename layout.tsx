import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Social Media Scheduler',
  description: 'Schedule your social media posts with Notion integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`h-full ${inter.className}`}>{children}</body>
    </html>
  );
} 