import { ReactNode } from 'react';

export const metadata = {
  title: 'CodeBlue - Healthcare Management',
  description: 'Smart patient management system',
};

interface SimpleLayoutProps {
  children: ReactNode;
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  return <main>{children}</main>;
}
