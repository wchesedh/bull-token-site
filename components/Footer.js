// components/Footer.js
import React from 'react';
import { FaXTwitter, FaDiscord, FaYoutube, FaInstagram } from 'react-icons/fa6'; // Using fa6 for FaXTwitter

export default function Footer() {
  return (
    <footer className="w-full bg-dark-brown mt-10 py-6 px-6 text-center text-sm text-warm-gray border-t border-gold shadow-inner">
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-4">
        <p className="text-gold font-bold mr-2">Connect:</p>
        <a href="https://x.com/i/communities/1851521387371917687" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-light-gold transition text-2xl flex items-center gap-1" aria-label="X Community"><FaXTwitter /><span className="text-sm">Community</span></a>
        <a href="#" className="text-gold hover:text-light-gold transition text-2xl flex items-center gap-1" aria-label="Discord"><FaDiscord /><span className="text-sm">Discord</span></a>
        <a href="#" className="text-gold hover:text-light-gold transition text-2xl flex items-center gap-1" aria-label="YouTube"><FaYoutube /><span className="text-sm">YouTube</span></a>
        <a href="#" className="text-gold hover:text-light-gold transition text-2xl flex items-center gap-1" aria-label="Instagram"><FaInstagram /><span className="text-sm">Instagram</span></a>
      </div>
      <p className="text-gold font-semibold">
        Built by 
        <span className="relative group">
          <a 
            href="https://x.com/naneksun" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-light-gold hover:text-gold transition underline ml-1"
          >
            JumpyWizard
          </a>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-dark-red text-light-gold text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
            Founder
          </span>
        </span>
        🧠 | Powered by Solana
      </p>
    </footer>
  );
}
