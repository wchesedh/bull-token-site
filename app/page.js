'use client';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const res = await fetch('/api/get-token');
        const json = await res.json();

        if (json.error) throw new Error(json.error);
        setTokenData(json);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchTokenData();
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🐂 Bull Token Dashboard</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!tokenData && !error && <p>Loading token data...</p>}
      {tokenData && (
        <>
          <p><strong>Name:</strong> {tokenData.name}</p>
          <p><strong>Symbol:</strong> {tokenData.symbol}</p>
          <p><strong>Description:</strong> {tokenData.description}</p>
          {tokenData.image && <img src={tokenData.image} alt="Token" width={200} />}
        </>
      )}
    </main>
  );
}
