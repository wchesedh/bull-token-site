'use client';

import { useState, useEffect } from 'react';

export default function TokenInfo({ token: initialToken, isLoading }) {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState(null);

  useEffect(() => {
    setToken(initialToken);
    setLoading(isLoading);
  }, [initialToken, isLoading]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/get-token');
        if (!res.ok) {
          throw new Error(`Failed to fetch token data: ${res.statusText}`);
        }
        const data = await res.json();
        setToken(data);
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTokenData();

    // Set up polling (e.g., every 60 seconds)
    const intervalId = setInterval(fetchTokenData, 60000); 

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  if (loading) {
    return (
      <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold animate-pulse">
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-700 rounded-full"></div>
          <div className="absolute -top-2 -right-2 bg-gray-600 px-2 py-1 rounded-full text-xs font-bold w-12 h-5"></div>
        </div>
        
        <div className="h-8 bg-gray-700 w-3/4 mx-auto mb-2 rounded"></div>
        <div className="h-6 bg-gray-600 w-1/2 mx-auto mb-6 rounded"></div>
        <div className="h-4 bg-gray-500 w-full mx-auto mb-6 rounded"></div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-red/30 p-3 rounded-lg h-20"></div>
          <div className="bg-dark-red/30 p-3 rounded-lg h-20"></div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="h-4 bg-gray-600 w-1/3 rounded"></div>
          <div className="h-4 w-4 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!token) return <p className="text-red-500">Token data unavailable</p>;

  const handleCopy = () => {
    navigator.clipboard.writeText(token.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold">
      <div className="relative">
        <img 
          src={token.image} 
          alt="Bull Token" 
          className="w-32 h-32 mx-auto mb-4 border-2 border-light-gold rounded-full object-cover"
        />
        <div className="absolute -top-2 -right-2 bg-gold text-dark-brown px-2 py-1 rounded-full text-xs font-bold">
          LIVE
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-gold">{token.name}</h1>
      <h2 className="text-xl text-warm-gray mb-2">({token.symbol})</h2>
      <p className="text-sm text-warm-gray mb-6">{token.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Total Supply</p>
          <p className="text-sm md:text-lg font-semibold text-light-gold break-words">{token.totalSupply}</p>
        </div>
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Holders</p>
          <p className="text-sm md:text-lg font-semibold text-light-gold break-words">{token.holders}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <p className="text-xs text-warm-gray">
          Contract: {token.mint}
        </p>
        <button 
          onClick={handleCopy}
          className="text-gold hover:text-light-gold transition relative"
          title="Copy contract address"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          {copied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gold text-dark-brown px-2 py-1 rounded text-xs whitespace-nowrap">
              Copied!
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
