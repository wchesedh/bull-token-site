'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WalletProvider from '../../components/WalletProvider';

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisits() {
      try {
        const res = await fetch('/api/visits');
        const data = await res.json();
        setVisits(data.visits || []);
      } catch (err) {
        console.error("Failed to load visits:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-br from-dark-brown to-dark-red flex flex-col items-center p-4">
          <h1 className="text-4xl font-bold mb-6 text-center text-gold">Visit Statistics</h1>
          
          {loading ? (
            <p className="text-warm-gray">Loading visits...</p>
          ) : (
            <div className="w-full max-w-4xl bg-dark-brown rounded-xl shadow-lg p-6 border border-gold">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-transparent text-warm-gray">
                  <thead>
                    <tr className="border-b border-gold">
                      <th className="py-2 px-4 text-left text-light-gold">Time</th>
                      <th className="py-2 px-4 text-left text-light-gold">IP Address</th>
                      <th className="py-2 px-4 text-left text-light-gold">Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((visit, index) => (
                      <tr key={index} className="border-b border-warm-gray/30 hover:bg-dark-red/20 transition">
                        <td className="py-2 px-4 text-sm">
                          {new Date(visit.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {visit.ip}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {visit.userAgent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
} 