import { ReactNode } from 'react';
import { SessionInitializer } from '@/components/shared/SessionInitializer';

export const metadata = {
  title: 'CodeBlue - Healthcare Management',
  description: 'Smart patient management system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionInitializer />
        {children}
      </body>
    </html>
  );
}
