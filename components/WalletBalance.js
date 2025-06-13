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
  const [dummyAddress, setDummyAddress] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      const targetPublicKey = dummyAddress ? new PublicKey(dummyAddress) : publicKey;

      if (!targetPublicKey) {
        setBalance(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const mintPublicKey = new PublicKey(MINT_ADDRESS);
        const associatedTokenAccount = getAssociatedTokenAddressSync(
          mintPublicKey,
          targetPublicKey,
          true // allowOwnerOffCurve - if the owner is a PDA
        );

        const accountInfo = await connection.getAccountInfo(associatedTokenAccount);

        if (!accountInfo) {
          setBalance("0");
        } else {
          const tokenBalance = await connection.getTokenAccountBalance(associatedTokenAccount);
          setBalance(tokenBalance.value.uiAmountString);
        }

      } catch (error) {
        console.error("Error fetching token balance:", error);
        setBalance("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [publicKey, connection, dummyAddress]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl mx-auto text-center mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Your Bull Token Balance</h3>
      <p className="text-gray-500 text-sm mb-2">
        {publicKey ? `Connected: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Connect wallet to see your balance.'}
      </p>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Paste dummy wallet address (for testing)"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={dummyAddress}
          onChange={(e) => setDummyAddress(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading balance...</p>
      ) : (
        <p className="text-2xl font-semibold text-yellow-600">{balance} BULL</p>
      )}
    </div>
  );
} 