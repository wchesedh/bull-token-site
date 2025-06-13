import './globals.css';

export const metadata = {
  title: 'Bull Token Dashboard',
  description: 'Solana Token Tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
