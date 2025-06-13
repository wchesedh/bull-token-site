// app/page.js
'use client';

import { useEffect, useState } from 'react';
import TokenInfo from '../components/TokenInfo';

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
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">🐂 Bull Token Dashboard</h1>
      {loading ? (
        <p className="text-gray-500">Loading token data...</p>
      ) : (
        <TokenInfo token={tokenData} />
      )}
    </main>
  );
}
