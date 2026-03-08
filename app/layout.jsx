import './globals.css';

export const metadata = {
  title: 'NovaDash | SaaS Sales Analytics',
  description: 'AI-powered Sales Analytics Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
