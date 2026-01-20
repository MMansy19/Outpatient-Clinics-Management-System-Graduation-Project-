import { ReactNode } from 'react';

export const metadata = {
  title: 'CodeBlue - Healthcare Management',
  description: 'Smart patient management system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
