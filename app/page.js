'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TokenInfo from '../components/TokenInfo';
import WalletProvider from '../components/WalletProvider';
import WalletBalance from '../components/WalletBalance';
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

    // Track visit
    fetch('/api/visits', { method: 'POST' }).catch(console.error);
    
    fetchToken();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-br from-dark-brown to-dark-red flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-6 text-center text-gold">🐂 Bulls Dashboard</h1>
          {/* <WalletConnect /> */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 animate-spin">
                  <svg className="w-full h-full text-gold" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" fillOpacity="0.2"/>
                    <path d="M12 2v4c4.41 0 8 3.59 8 8h4c0-6.63-5.37-12-12-12z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute inset-0 animate-bounce">
                  <svg className="w-full h-full text-gold" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" fillOpacity="0.2"/>
                    <path d="M12 2v4c4.41 0 8 3.59 8 8h4c0-6.63-5.37-12-12-12z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <p className="text-warm-gray animate-pulse">Loading token data...</p>
            </div>
          ) : (
            <>
              <TokenInfo token={tokenData} />
              <WalletBalance />
            </>
          )}
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
}
