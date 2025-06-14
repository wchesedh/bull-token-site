'use client';

import { useEffect, useState } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WalletProvider from '../../components/WalletProvider';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/get-crypto-news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark-brown to-dark-red">
        <Header />
        <main className="flex-grow p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gold mb-8 text-center">Crypto News</h1>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-dark-red/30 p-4 rounded-lg border border-gold/50">
                    <div className="h-4 bg-gold/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gold/20 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gold/20 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-warm-gray">
                Failed to load news. Please try again later.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item, index) => (
                  <div key={index} className="bg-dark-red/30 p-4 rounded-lg border border-gold/50 hover:bg-dark-red/40 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaNewspaper className="text-gold text-2xl" />
                      <h2 className="text-lg font-semibold text-light-gold">{item.title}</h2>
                    </div>
                    <p className="text-sm text-warm-gray mb-4 line-clamp-3">{item.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gold/70">
                        {new Date(item.published_on * 1000).toLocaleDateString()}
                      </span>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-light-gold text-sm hover:underline"
                      >
                        Read Full Article
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
} 