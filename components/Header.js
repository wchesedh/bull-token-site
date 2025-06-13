// components/Header.js
import React from 'react';
import WalletConnect from './WalletConnect';

export default function Header() {
  return (
    <header className="w-full bg-dark-brown shadow-lg py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gold flex items-center gap-2">🐂 Bull Token</h1>
      <div className="flex items-center">
        <WalletConnect />
      </div>
    </header>
  );
}
