'use client';

import { useEffect, useState, useTransition } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WalletProvider from '../../components/WalletProvider';
import { fetchCryptoNews } from '../../lib/api';

const PLACEHOLDER_NEWS = Array(6).fill(null).map((_, i) => ({
  title: `Loading news item ${i + 1}...`,
  body: 'Please wait while we fetch the latest updates.',
  published_on: Math.floor(Date.now() / 1000),
  url: '#'
}));

export default function NewsPage() {
  const [news, setNews] = useState(PLACEHOLDER_NEWS);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchCryptoNews();
        startTransition(() => {
          setNews(data);
          setError(null);
        });
      } catch (err) {
        console.error('Error fetching news:', err);
        startTransition(() => {
          setError(err.message);
          setNews([]);
        });
      }
    };

    loadNews();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark-brown to-dark-red">
        <Header />
        <main className="flex-grow p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gold mb-8 text-center">Crypto News</h1>
            
            {error ? (
              <div className="text-center text-warm-gray bg-dark-red/30 p-4 rounded-lg border border-gold/50">
                <p className="mb-2">Failed to load news. Please try again later.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-light-gold hover:underline transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item, index) => (
                  <div 
                    key={index} 
                    className={`bg-dark-red/30 p-4 rounded-lg border border-gold/50 transition-all duration-300 ${
                      isPending ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'
                    } hover:bg-dark-red/40`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <FaNewspaper className="text-gold text-2xl" />
                      <h2 className="text-lg font-semibold text-light-gold line-clamp-2">{item.title}</h2>
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
                        className="text-light-gold text-sm hover:underline transition-colors duration-200"
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