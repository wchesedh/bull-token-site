// components/Header.js
import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-red-600">🐂 Bull Token</h1>
      <span className="text-sm text-gray-500">Solana Dashboard</span>
    </header>
  );
}
