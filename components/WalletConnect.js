'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton with ssr: false
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function WalletConnect() {
  const { publicKey } = useWallet();

  return (
    <div className="flex flex-col items-end gap-2">
      <WalletMultiButton className="!bg-gold !text-dark-brown !font-bold !rounded-lg !shadow-md hover:!bg-light-gold transition" />
      {publicKey && (
        <p className="text-xs text-warm-gray text-right">
          Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </p>
      )}
    </div>
  );
} 