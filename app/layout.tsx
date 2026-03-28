import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Baildon — Parent Assistant',
  description: 'Ask questions about school policies, events, and news.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
