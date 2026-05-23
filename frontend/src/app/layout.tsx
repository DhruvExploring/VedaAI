import "./globals.css";

export const metadata = {
  title: 'VedaAI — AI-Powered Assessment Creator',
  description: 'Create structured, AI-generated exam papers in seconds. Set rubrics, define marking criteria, and let AI assist with grading.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}