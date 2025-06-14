'use client';

import { useEffect, useState } from 'react';
import { FaGift, FaCoins, FaImage, FaCalendarAlt, FaDollarSign, FaChartLine, FaGraduationCap, FaSearch } from 'react-icons/fa';
import { SiTradingview } from 'react-icons/si';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TokenInfo from '../components/TokenInfo';
import WalletProvider from '../components/WalletProvider';
import WalletBalance from '../components/WalletBalance';
import CommunityStats from '../components/CommunityStats';
import CryptoNews from '../components/CryptoNews';
import BackToTop from '../components/BackToTop';
import Roadmap from '../components/Roadmap';

export default function HomePage() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setTokenData(data);
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTokenData();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark-brown to-dark-red">
        <Header />
        <main className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          {/* Left Sidebar: News & Events */}
          <div className="hidden md:block p-4 bg-dark-brown rounded-xl shadow-lg space-y-6">
            <CryptoNews />
            
            {/* Event Announcement Card */}
            <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50 flex items-center space-x-3">
              <FaCalendarAlt className="text-gold text-3xl" />
              <div>
                <h4 className="text-md font-semibold text-light-gold mb-1">Community AMA Next Week!</h4>
                <p className="text-xs text-warm-gray">Join us for an Ask Me Anything session with the core team. Submit your questions now!</p>
              </div>
            </div>

            {/* DeFi News Card */}
            <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50 flex items-center space-x-3">
              <FaDollarSign className="text-gold text-3xl" />
              <div>
                <h4 className="text-md font-semibold text-light-gold mb-1">New DeFi Protocol Launched!</h4>
                <p className="text-xs text-warm-gray">Explore the latest decentralized finance opportunities. High APY yields available.</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-start">
            <h1 className="text-4xl font-bold text-gold mb-6 text-center">🐂 Bulls Dashboard</h1>

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
                <TokenInfo token={tokenData} isLoading={loading} />
                <WalletBalance />
                <CommunityStats />
              </>
            )}
          </div>

          {/* Right Sidebar: Bull Token Ecosystem */}
          <div className="hidden md:block p-4 bg-dark-brown rounded-xl shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-gold mb-4">Bull Token Ecosystem</h3>

            {/* Airdrop Card */}
            <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50 flex items-center space-x-3">
              <FaGift className="text-gold text-3xl" />
              <div>
                <h4 className="text-md font-semibold text-light-gold mb-1">Exclusive Airdrop for BULL Holders!</h4>
                <p className="text-xs text-warm-gray">Don't miss out on your free BULL tokens. Check eligibility now!</p>
                <a href="#" className="text-light-gold text-sm hover:underline mt-2 inline-block">Claim Now</a>
              </div>
            </div>

            {/* Staking Card */}
            <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50 flex items-center space-x-3">
              <FaCoins className="text-gold text-3xl" />
              <div>
                <h4 className="text-md font-semibold text-light-gold mb-1">Stake Your BULL for Rewards!</h4>
                <p className="text-xs text-warm-gray">Earn passive income by staking your tokens in our secure pool.</p>
                <a href="#" className="text-light-gold text-sm hover:underline mt-2 inline-block">Stake Now</a>
              </div>
            </div>

            {/* NFT Collection Card */}
            <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50 flex items-center space-x-3">
              <FaImage className="text-gold text-3xl" />
              <div>
                <h4 className="text-md font-semibold text-light-gold mb-1">Limited Edition BULL NFTs Dropping Soon!</h4>
                <p className="text-xs text-warm-gray">Get ready for exclusive digital collectibles tied to the Bull ecosystem.</p>
                <a href="#" className="text-light-gold text-sm hover:underline mt-2 inline-block">View Collection</a>
              </div>
            </div>

            {/* Useful Crypto Links Section */}
            <h3 className="text-xl font-bold text-gold mb-4 mt-6">Useful Crypto Links</h3>
            <div className="space-y-2">
              <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="block bg-dark-red/30 p-3 rounded-lg border border-gold/50 text-light-gold hover:bg-dark-red/50 transition-colors text-sm flex items-center space-x-3">
                <FaChartLine className="text-gold text-xl" />
                <span>CoinGecko (Market Data)</span>
              </a>
              <a href="https://solscan.io/" target="_blank" rel="noopener noreferrer" className="block bg-dark-red/30 p-3 rounded-lg border border-gold/50 text-light-gold hover:bg-dark-red/50 transition-colors text-sm flex items-center space-x-3">
                <FaSearch className="text-gold text-xl" />
                <span>Solscan (Solana Explorer)</span>
              </a>
              <a href="https://academy.binance.com/" target="_blank" rel="noopener noreferrer" className="block bg-dark-red/30 p-3 rounded-lg border border-gold/50 text-light-gold hover:bg-dark-red/50 transition-colors text-sm flex items-center space-x-3">
                <FaGraduationCap className="text-gold text-xl" />
                <span>Binance Academy (Learn Crypto)</span>
              </a>
              <a href="https://www.tradingview.com/markets/cryptocurrencies/" target="_blank" rel="noopener noreferrer" className="block bg-dark-red/30 p-3 rounded-lg border border-gold/50 text-light-gold hover:bg-dark-red/50 transition-colors text-sm flex items-center space-x-3">
                <SiTradingview className="text-gold text-xl" />
                <span>TradingView (Charts)</span>
              </a>
            </div>
          </div>
        </main>

        {/* Roadmap Section */}
        <Roadmap />
        
        <Footer />
        <BackToTop />
      </div>
    </WalletProvider>
  );
}
