'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';

export default function WalletBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const mintPublicKey = new PublicKey(MINT_ADDRESS);
        const associatedTokenAccount = getAssociatedTokenAddressSync(
          mintPublicKey,
          publicKey,
          true // allowOwnerOffCurve - if the owner is a PDA
        );

        // Check if the associated token account exists
        const accountInfo = await connection.getAccountInfo(associatedTokenAccount);

        if (!accountInfo) {
          // If account doesn't exist, balance is 0
          setBalance("0");
        } else {
          const tokenBalance = await connection.getTokenAccountBalance(associatedTokenAccount);
          setBalance(tokenBalance.value.uiAmountString);
        }

      } catch (error) {
        console.error("Error fetching token balance:", error);
        setBalance("N/A");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  if (!publicKey) {
    return <p className="text-gray-500 text-sm">Connect wallet to see token balance.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl mx-auto text-center mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Your Bull Token Balance</h3>
      {loading ? (
        <p className="text-gray-500">Loading balance...</p>
      ) : (
        <p className="text-2xl font-semibold text-yellow-600">{balance} {MINT_ADDRESS.slice(0,4)}...</p>
      )}
    </div>
  );
} 