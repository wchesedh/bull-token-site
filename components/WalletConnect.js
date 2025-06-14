'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

export default function WalletConnect() {
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="wallet-connect-wrapper">
      <WalletMultiButton className="!bg-dark-red hover:!bg-dark-red/80 !text-gold !border !border-gold/50 !rounded-lg !px-4 !py-2 !font-semibold !transition-all !duration-200 hover:!scale-105" />
      <style jsx global>{`
        .wallet-adapter-button {
          background-color: transparent !important;
          color: #D4AF37 !important;
          border: 1px solid rgba(212, 175, 55, 0.5) !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
        }
        .wallet-adapter-button:hover {
          background-color: rgba(139, 0, 0, 0.8) !important;
          transform: scale(1.05) !important;
        }
        .wallet-adapter-button-trigger {
          background-color: transparent !important;
        }
        .wallet-adapter-modal {
          background-color: #1a0f0f !important;
        }
        .wallet-adapter-modal-wrapper {
          background-color: #1a0f0f !important;
        }
        .wallet-adapter-modal-button-close {
          background-color: transparent !important;
          border: 1px solid rgba(212, 175, 55, 0.5) !important;
        }
        .wallet-adapter-modal-button-close:hover {
          background-color: rgba(139, 0, 0, 0.8) !important;
        }
        .wallet-adapter-modal-list {
          background-color: #1a0f0f !important;
        }
        .wallet-adapter-modal-list-more {
          color: #D4AF37 !important;
        }
        .wallet-adapter-modal-list-more:hover {
          background-color: rgba(139, 0, 0, 0.8) !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button {
          background-color: transparent !important;
          border: 1px solid rgba(212, 175, 55, 0.5) !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button:hover {
          background-color: rgba(139, 0, 0, 0.8) !important;
        }
      `}</style>
    </div>
  );
} 