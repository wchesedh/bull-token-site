'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createTransferInstruction } from '@solana/spl-token';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump'; // Your Bull Token Mint Address
const TOKEN_DECIMALS = 9; // Assuming 9 decimals for your token, adjust if different
const TEST_CONNECTED_WALLET = '5TKZtq8RZKgo7SNpEUNcbbx8Y65S2pDxSpcmyEhZBp1Y'; // Wallet to connect for testing
const TEST_DISPLAY_BALANCE_FOR_WALLET = '9BRRVCg7yAZKdgcubYZ5Qr9yUtweU2LYXQqAQmg2vgc'; // Wallet whose balance will be displayed

export default function WalletBalance() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Send token states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      let targetPublicKey = publicKey; // Default to connected wallet

      // Override targetPublicKey if TEST_CONNECTED_WALLET is connected
      if (publicKey && publicKey.toBase58() === TEST_CONNECTED_WALLET) {
        targetPublicKey = new PublicKey(TEST_DISPLAY_BALANCE_FOR_WALLET);
      }

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

        // Fetch transactions if test wallet is connected
        if (publicKey && publicKey.toBase58() === TEST_CONNECTED_WALLET) {
          setLoadingTransactions(true);
          try {
            const signatures = await connection.getSignaturesForAddress(associatedTokenAccount, { limit: 10 });
            const txDetails = await Promise.all(
              signatures.map(async (sig) => {
                const tx = await connection.getTransaction(sig.signature, {
                  maxSupportedTransactionVersion: 0
                });
                return {
                  signature: sig.signature,
                  timestamp: sig.blockTime,
                  amount: tx?.meta?.postTokenBalances?.[0]?.uiTokenAmount?.uiAmount || 0,
                  link: `https://solscan.io/tx/${sig.signature}?cluster=mainnet`
                };
              })
            );
            setTransactions(txDetails);
          } catch (error) {
            console.error("Error fetching transactions:", error);
          } finally {
            setLoadingTransactions(false);
          }
        }

      } catch (error) {
        console.error("Error fetching token balance:", error);
        setBalance("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

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

    setSending(true);
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
        setSending(false);
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
      setSending(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold">
            <h3 className="text-xl font-bold text-gold mb-2">Your Bull Token Balance</h3>
            <p className="text-warm-gray text-sm mb-2">
              {publicKey ? `Connected: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Connect wallet to see your balance.'}
            </p>

            {loading ? (
              <p className="text-warm-gray">Loading balance...</p>
            ) : (
              <p className="text-2xl font-semibold text-light-gold">{balance} BULL</p>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto border border-gold">
            <h3 className="text-xl font-bold text-gold mb-4 text-center">Recent Bull Token Transactions</h3>
            {loadingTransactions ? (
              <p className="text-warm-gray text-center">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-transparent text-warm-gray">
                  <thead>
                    <tr className="border-b border-gold">
                      <th className="py-2 px-4 text-left text-light-gold">Date</th>
                      <th className="py-2 px-4 text-left text-light-gold">Amount</th>
                      <th className="py-2 px-4 text-left text-light-gold">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.signature} className="border-b border-warm-gray/30 hover:bg-dark-red/20 transition">
                        <td className="py-2 px-4 text-sm">
                          {new Date(tx.timestamp * 1000).toLocaleString().split(', ')[0]}
                        </td>
                        <td className="py-2 px-4 text-sm font-semibold text-light-gold">
                          {tx.amount} BULL
                        </td>
                        <td className="py-2 px-4 text-sm">
                          <a href={tx.link} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-warm-gray text-center">No recent transactions found</p>
            )}
          </div>
        );

      case 'send':
        return (
          <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto border border-gold">
            <h3 className="text-xl font-bold text-gold mb-4 text-center">Send Bull Tokens</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient Wallet Address"
                className="w-full p-2 border border-warm-gray bg-transparent text-light-gold placeholder-warm-gray rounded-md text-sm outline-none focus:border-gold transition"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full p-2 border border-warm-gray bg-transparent text-light-gold placeholder-warm-gray rounded-md text-sm outline-none focus:border-gold transition"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={handleSendTokens}
                disabled={sending || !publicKey}
                className={`w-full py-2 px-4 rounded-md font-bold transition ${
                  sending || !publicKey 
                    ? 'bg-warm-gray text-dark-brown cursor-not-allowed' 
                    : 'bg-dark-red text-light-gold hover:bg-gold hover:text-dark-brown'
                }`}
              >
                {sending ? 'Sending...' : 'Send Tokens'}
              </button>
            </div>
            {message && (
              <p className={`mt-4 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      <div className="flex border-b border-gold mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-4 text-center font-semibold ${
            activeTab === 'dashboard'
              ? 'text-gold border-b-2 border-gold'
              : 'text-warm-gray hover:text-light-gold'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 px-4 text-center font-semibold ${
            activeTab === 'transactions'
              ? 'text-gold border-b-2 border-gold'
              : 'text-warm-gray hover:text-light-gold'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-2 px-4 text-center font-semibold ${
            activeTab === 'send'
              ? 'text-gold border-b-2 border-gold'
              : 'text-warm-gray hover:text-light-gold'
          }`}
        >
          Send
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
} 