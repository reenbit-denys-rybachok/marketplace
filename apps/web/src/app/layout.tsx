import type { Metadata } from 'next';
import { RequestLoader } from './request-loader';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketOps LocalCraft',
  description: 'Ecommerce pet project starter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RequestLoader />
        {children}
      </body>
    </html>
  );
}
