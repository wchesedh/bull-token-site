'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump'; // Your Bull Token Mint Address
const TEST_WALLET_ADDRESS = '5TKZtq8RZKgo7SNpEUNcbbx8Y65S2pDxSpcmyEhZBp1Y'; // The specified test wallet

export default function WalletBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [dummyAddress, setDummyAddress] = useState(''); // Removed state for dummy address

  useEffect(() => {
    const fetchBalance = async () => {
      // Use connected publicKey only
      const targetPublicKey = publicKey;

      if (!targetPublicKey) {
        setBalance(null);
        setLoading(false);
        return;
      }

      // Special handling for the test wallet address
      if (targetPublicKey.toBase58() === TEST_WALLET_ADDRESS) {
        setBalance("1.3M");
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
  }, [publicKey, connection]); // Removed dummyAddress from dependencies

  return (
    <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center mt-6 border border-gold">
      <h3 className="text-xl font-bold text-gold mb-2">Your Bull Token Balance</h3>
      <p className="text-warm-gray text-sm mb-2">
        {publicKey ? `Connected: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Connect wallet to see your balance.'}
      </p>

      {/* Removed input field for dummy address */}

      {loading ? (
        <p className="text-warm-gray">Loading balance...</p>
      ) : (
        <p className="text-2xl font-semibold text-light-gold">{balance} BULL</p>
      )}
    </div>
  );
} 