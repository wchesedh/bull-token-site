'use client';

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump'; // Your Bull Token Mint Address
const TOKEN_DECIMALS = 9; // Assuming 9 decimals for your token, adjust if different

export default function SendToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSendTokens = async () => {
    if (!publicKey) {
      setMessage('Please connect your wallet first.');
      setIsError(true);
      return;
    }
    if (!recipient || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid recipient address and a positive amount.');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const mintPublicKey = new PublicKey(MINT_ADDRESS);
      const recipientPublicKey = new PublicKey(recipient);

      // Get associated token accounts
      const fromTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        publicKey
      );
      const toTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        recipientPublicKey
      );

      // Check if sender has an associated token account
      const fromAccountInfo = await connection.getAccountInfo(fromTokenAccount);
      if (!fromAccountInfo) {
        setMessage('You do not have an associated token account for Bull Token.');
        setIsError(true);
        setLoading(false);
        return;
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        parseFloat(amount) * (10 ** TOKEN_DECIMALS) // Amount in smallest units
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create a new Transaction object
      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;

      // Send transaction using wallet adapter
      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });

      setMessage(`Transaction sent: ${signature}`);
      setAmount(''); // Clear amount field
      // Optionally, clear recipient too: setRecipient('');
    } catch (error) {
      console.error("Error sending tokens:", error);
      setMessage(`Failed to send tokens: ${error.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl mx-auto text-center mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Send Bull Tokens</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Recipient Wallet Address"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={handleSendTokens}
          disabled={loading || !publicKey}
          className={`w-full py-2 px-4 rounded-md font-bold transition ${loading || !publicKey ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-brown-800 hover:bg-yellow-600'}`}
        >
          {loading ? 'Sending...' : 'Send Tokens'}
        </button>
      </div>
      {message && (
        <p className={`mt-4 text-sm ${isError ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
      )}
    </div>
  );
} 