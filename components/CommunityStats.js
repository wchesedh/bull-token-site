'use client';

import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { FaCopy } from 'react-icons/fa';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';
const HOLDERS_PER_PAGE = 10;
const REFRESH_INTERVAL = 60000; // 60 seconds

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

        const tokenRes = await fetch('/api/get-token');
        if (!tokenRes.ok) {
          throw new Error(`Failed to fetch token data: ${tokenRes.statusText}`);
        }
        const data = await tokenRes.json();
        console.log('API Token data received:', data); // Debug log for API response

        if (!data.allHolders) {
          throw new Error('No holder data available from API');
        }

        // Filter out the Token Program ID if it somehow slipped through (redundant but safe)
        const filteredAndSortedHolders = [...data.allHolders]
          .filter(holder => holder.owner !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' && parseFloat(holder.uiAmount) > 0)
          .sort((a, b) => parseFloat(b.uiAmount) - parseFloat(a.uiAmount));

        setStats({
          totalHolders: filteredAndSortedHolders.length || 0,
          newHolders24h: Math.floor((filteredAndSortedHolders.length || 0) * 0.1), // Placeholder
          activeHolders24h: Math.floor((filteredAndSortedHolders.length || 0) * 0.3), // Placeholder
          allHolders: filteredAndSortedHolders
        });
        console.log('CommunityStats state updated:', { // Debug log for component state
          totalHolders: filteredAndSortedHolders.length || 0,
          allHoldersCount: filteredAndSortedHolders.length,
          firstFiveHolders: filteredAndSortedHolders.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCommunityStats();

    // Set up polling
    const intervalId = setInterval(fetchCommunityStats, REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Calculate pagination
  const totalPages = Math.ceil(stats.allHolders.length / HOLDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * HOLDERS_PER_PAGE;
  const endIndex = startIndex + HOLDERS_PER_PAGE;
  const currentHolders = stats.allHolders.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold mt-6 animate-pulse">
        <div className="h-8 bg-gray-700 w-1/2 mx-auto mb-6 rounded"></div>
        
        {/* Holder Statistics Skeletons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-red/30 p-3 rounded-lg h-20"></div>
          <div className="bg-dark-red/30 p-3 rounded-lg h-20"></div>
          <div className="bg-dark-red/30 p-3 rounded-lg h-20"></div>
        </div>

        {/* Top Holders List Skeleton */}
        <div>
          <div className="h-6 bg-gray-700 w-1/3 mx-auto mb-3 rounded"></div>
          <div className="space-y-2 mb-4">
            {[...Array(HOLDERS_PER_PAGE)].map((_, i) => (
              <div key={i} className="bg-dark-red/30 p-2 rounded-lg flex justify-between items-center h-10"></div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-8 w-20 bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-600 rounded"></div>
            <div className="h-8 w-20 bg-gray-700 rounded"></div>
          </div>
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
        <h3 className="text-lg font-semibold text-gold mb-3">Top Holders</h3>
        {currentHolders.length === 0 ? (
          <div className="text-warm-gray">No holders found</div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {currentHolders.map((holder, index) => (
                <div key={index} className="bg-dark-red/30 p-2 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-warm-gray text-sm">
                      {holder.owner.slice(0, 4)}...{holder.owner.slice(-4)}
                    </span>
                    <button
                      onClick={() => handleCopy(holder.owner)}
                      className="text-gold hover:text-light-gold transition-colors relative"
                    >
                      <FaCopy className="h-4 w-4" />
                      {copiedAddress === holder.owner && (
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