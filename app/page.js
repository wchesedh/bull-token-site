'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TokenInfo from '../components/TokenInfo';
import WalletProvider from '../components/WalletProvider';
// import WalletConnect from '../components/WalletConnect';

export default function HomePage() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch('/api/get-token');
        const data = await res.json();
        setTokenData(data);
      } catch (err) {
        console.error("Failed to load token data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-br from-yellow-200 via-yellow-100 to-red-300 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-6 text-center">🐂 Bull Token Dashboard</h1>
          {/* <WalletConnect /> */}
          {loading ? (
            <p className="text-gray-500">Loading token data...</p>
          ) : (
            <TokenInfo token={tokenData} />
          )}
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
}
