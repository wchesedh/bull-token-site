'use client';

import { useEffect, useState } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import Link from 'next/link';

export default function CryptoNews() {
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
        setNews(data.slice(0, 2)); // Get only top 2 news items
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gold">News & Events</h3>
          <Link href="/news" className="text-light-gold text-sm hover:underline">
            View All
          </Link>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-dark-red/30 p-3 rounded-lg border border-gold/50">
              <div className="h-4 bg-gold/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gold/20 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gold">News & Events</h3>
          <Link href="/news" className="text-light-gold text-sm hover:underline">
            View All
          </Link>
        </div>
        <div className="bg-dark-red/30 p-3 rounded-lg border border-gold/50">
          <p className="text-warm-gray">Failed to load news. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gold">News & Events</h3>
        <Link href="/news" className="text-light-gold text-sm hover:underline">
          View All
        </Link>
      </div>
      {news.map((item, index) => (
        <div key={index} className="bg-dark-red/30 p-3 rounded-lg border border-gold/50">
          <div className="flex items-center space-x-3">
            <FaNewspaper className="text-gold text-2xl flex-shrink-0" />
            <div>
              <h4 className="text-md font-semibold text-light-gold mb-1 line-clamp-1">{item.title}</h4>
              <p className="text-xs text-warm-gray line-clamp-2">{item.body}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gold/70">{new Date(item.published_on * 1000).toLocaleDateString()}</span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-light-gold text-xs hover:underline"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 