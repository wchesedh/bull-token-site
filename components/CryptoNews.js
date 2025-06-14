'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import Link from 'next/link';
import { fetchCryptoNews } from '../lib/api';

// Initial loading state with placeholder data
const initialNews = [
  {
    title: 'Loading latest crypto news...',
    body: 'Please wait while we fetch the most recent updates from the crypto world.',
    published_on: Math.floor(Date.now() / 1000),
    url: '#'
  },
  {
    title: 'Loading more updates...',
    body: 'We\'re getting everything ready for you.',
    published_on: Math.floor(Date.now() / 1000),
    url: '#'
  }
];

export default function CryptoNews() {
  const [news, setNews] = useState(initialNews);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      const data = await fetchCryptoNews();
      startTransition(() => {
        setNews(data.slice(0, 2));
        setError(null);
      });
    } catch (err) {
      console.error('Error fetching news:', err);
      startTransition(() => {
        setError(err.message);
        if (news === initialNews) {
          setNews([]);
        }
      });
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gold">News & Events</h3>
        <Link 
          href="/news" 
          className="text-light-gold text-sm hover:underline transition-colors duration-200"
        >
          View All
        </Link>
      </div>
      {error && news.length === 0 ? (
        <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50">
          <p className="text-warm-gray">Failed to load news. Please try again later.</p>
        </div>
      ) : (
        news.map((item, index) => (
          <div 
            key={index} 
            className={`bg-dark-red/30 p-3 rounded-lg border border-gold/50 transition-all duration-300 ${
              isPending ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'
            } hover:bg-dark-red/40`}
          >
            <div className="flex items-center space-x-3">
              <FaNewspaper className="text-gold text-2xl flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <h4 className="text-md font-semibold text-light-gold mb-1 line-clamp-1">{item.title}</h4>
                <p className="text-xs text-warm-gray line-clamp-2">{item.body}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gold/70">
                    {new Date(item.published_on * 1000).toLocaleDateString()}
                  </span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-light-gold text-xs hover:underline transition-colors duration-200"
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 