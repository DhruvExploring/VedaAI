import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'VedaAI — Assessment Creator',
  description: 'Create AI-powered exam papers in seconds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1713',
              color: '#faf8f4',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#4f7f4f', secondary: '#faf8f4' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#faf8f4' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
