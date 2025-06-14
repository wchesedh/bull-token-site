'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createTransferInstruction } from '@solana/spl-token';
import { FaCopy, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump'; // Your Bull Token Mint Address
const TOKEN_DECIMALS = 9; // Assuming 9 decimals for your token, adjust if different
const TEST_CONNECTED_WALLET = '5TKZtq8RZKgo7SNpEUNcbbx8Y65S2pDxSpcmyEhZBp1Y'; // Wallet to connect for testing
const TEST_DISPLAY_BALANCE_FOR_WALLET = '9BRRVCg7yAZKdgcubYZ5Qr9yUtweU2LYXQqAQmg2vgc'; // Wallet whose balance will be displayed
const DEFAULT_TRANSACTIONS_PER_PAGE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function WalletBalance() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [transactionsPerPage, setTransactionsPerPage] = useState(DEFAULT_TRANSACTIONS_PER_PAGE);
  const [allSignatures, setAllSignatures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Send token states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchAllSignatures = async () => {
    let targetPublicKey = publicKey;
    // If no wallet connected, but TEST_DISPLAY_BALANCE_FOR_WALLET is set, use it.
    if (!publicKey && TEST_DISPLAY_BALANCE_FOR_WALLET) {
      targetPublicKey = new PublicKey(TEST_DISPLAY_BALANCE_FOR_WALLET);
    }
    // If a test wallet is connected, override with TEST_DISPLAY_BALANCE_FOR_WALLET for display
    else if (publicKey && publicKey.toBase58() === TEST_CONNECTED_WALLET) {
      targetPublicKey = new PublicKey(TEST_DISPLAY_BALANCE_FOR_WALLET);
    }

    if (!targetPublicKey) {
      setAllSignatures([]);
      setTotalTransactions(0);
      return;
    }

    try {
      const mintPublicKey = new PublicKey(MINT_ADDRESS);
      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        targetPublicKey,
        true
      );

      let allSigs = [];
      let lastSig = undefined;
      let hasMore = true;

      while (hasMore) {
      const signatures = await connection.getSignaturesForAddress(
        associatedTokenAccount,
          { limit: 1000, before: lastSig }
        );

        if (signatures.length === 0) {
          hasMore = false;
        } else {
          allSigs.push(...signatures);
          lastSig = signatures[signatures.length - 1].signature;
          // Optional: Add a small delay to avoid hitting RPC rate limits too hard
          // await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setAllSignatures(allSigs);
      setTotalTransactions(allSigs.length);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      setAllSignatures([]);
      setTotalTransactions(0);
    }
  };

  const fetchTransactions = async (page = 1) => {
    if (allSignatures.length === 0) {
      setTransactions([]);
      return;
    }

    setLoadingTransactions(true);
    try {
      const startIndex = (page - 1) * transactionsPerPage;
      const endIndex = startIndex + transactionsPerPage;
      const pageSignatures = allSignatures.slice(startIndex, endIndex);

      const txDetails = await Promise.all(
        pageSignatures.map(async (sig) => {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          return {
            signature: sig.signature,
            timestamp: tx?.blockTime || null,
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
  };

  useEffect(() => {
    const fetchBalance = async () => {
      let targetPublicKey = publicKey;

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
          true
        );

        const accountInfo = await connection.getAccountInfo(associatedTokenAccount);

        if (!accountInfo) {
          setBalance("0");
        } else {
          const tokenBalance = await connection.getTokenAccountBalance(associatedTokenAccount);
          setBalance(tokenBalance.value.uiAmountString);
        }

        // Fetch transactions only if TEST_CONNECTED_WALLET is specifically used for display purposes
        // If not using the test wallet, transaction fetching is handled by the useEffect below
        if (publicKey && publicKey.toBase58() === TEST_CONNECTED_WALLET) {
          await fetchAllSignatures();
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

  // Separate useEffect to fetch signatures for the TEST_DISPLAY_BALANCE_FOR_WALLET when no wallet is connected
  useEffect(() => {
    if (!publicKey && TEST_DISPLAY_BALANCE_FOR_WALLET) {
      fetchAllSignatures();
    } else if (publicKey) {
      // Only fetch if a real wallet is connected or the TEST_CONNECTED_WALLET is used
      if (publicKey.toBase58() !== TEST_CONNECTED_WALLET) {
         fetchAllSignatures();
      }
    }
  }, [publicKey, connection, TEST_DISPLAY_BALANCE_FOR_WALLET]); // Re-run when wallet connection or test wallet changes


  // Reset transactions when wallet disconnects
  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      setTotalTransactions(0);
      setCurrentPage(1);
      setAllSignatures([]);
    }
  }, [publicKey]);

  // Fetch transactions when page or items per page changes
  useEffect(() => {
    if (allSignatures.length > 0) {
      fetchTransactions(currentPage);
    }
  }, [currentPage, transactionsPerPage, allSignatures]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied!');
    setIsError(false);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleSendTokens = async () => {
    if (!publicKey) {
      setMessage('Please connect your wallet to send tokens.');
      setIsError(true);
      return;
    }

    if (!recipient || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid recipient address and amount.');
      setIsError(true);
      return;
    }

    setSending(true);
    setMessage('Sending tokens...');
    setIsError(false);

    try {
      const recipientPublicKey = new PublicKey(recipient);
      const mintPublicKey = new PublicKey(MINT_ADDRESS);

      const fromTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        publicKey,
        true
      );

      const toTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        recipientPublicKey,
        true
      );

      // Ensure the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(toTokenAccount);
      if (!recipientAccountInfo) {
        // Optionally, create the associated token account for the recipient
        // if it doesn't exist. This usually requires the recipient to pay for rent.
        // For simplicity, we're assuming it exists or will be created externally.
        setMessage('Recipient token account does not exist. Please ensure the recipient has interacted with the token.');
        setIsError(true);
        setSending(false);
        return;
      }

      const transaction = new Transaction().add(
        createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
          parseFloat(amount) * Math.pow(10, TOKEN_DECIMALS)
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      setMessage(`Tokens sent successfully! Transaction: ${signature.slice(0, 8)}...`);
      setRecipient('');
      setAmount('');
      // Re-fetch balance and transactions after successful send
        await fetchAllSignatures();
    } catch (error) {
      console.error("Error sending tokens:", error);
      setMessage(`Failed to send tokens: ${error.message}`);
      setIsError(true);
    } finally {
      setSending(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'dashboard') {
      if (loading) {
        return (
          <div className="animate-pulse">
            <div className="bg-gray-700 h-8 w-1/2 mx-auto mb-4 rounded"></div>
            <div className="bg-gray-600 h-6 w-1/3 mx-auto mb-6 rounded"></div>
            <div className="bg-dark-red/30 p-4 rounded-lg h-32 mb-6"></div>
            <div className="bg-dark-red/30 p-4 rounded-lg h-40"></div>
          </div>
        );
      }

      const walletAddressToDisplay = publicKey ? publicKey.toBase58() : TEST_DISPLAY_BALANCE_FOR_WALLET;

      return (
        <div className="space-y-6">
          {publicKey ? (
            <h3 className="text-xl font-semibold text-gold text-center">
              Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </h3>
          ) : (
            <h3 className="text-xl font-semibold text-warm-gray text-center">
              No wallet connected. Displaying data for test wallet:
              <span className="ml-2 text-gold flex items-center justify-center">
                {TEST_DISPLAY_BALANCE_FOR_WALLET.slice(0, 4)}...{TEST_DISPLAY_BALANCE_FOR_WALLET.slice(-4)}
                <button
                  onClick={() => handleCopy(TEST_DISPLAY_BALANCE_FOR_WALLET)}
                  className="ml-2 text-gold hover:text-light-gold transition-colors"
                  title="Copy wallet address"
                >
                  <FaCopy className="h-4 w-4" />
                </button>
              </span>
            </h3>
          )}
          
          <div className="bg-dark-red/30 p-4 rounded-lg border border-gold/50">
            <h4 className="text-lg font-semibold text-light-gold mb-2">Your BULL Balance</h4>
            <p className="text-3xl font-bold text-gold">{balance !== null ? balance : 'Loading...'}</p>
          </div>

          {/* Send Tokens Section */}
          <div className="bg-dark-red/30 p-4 rounded-lg border border-gold/50">
            <h4 className="text-lg font-semibold text-light-gold mb-4">Send BULL Tokens</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-warm-gray mb-1">Recipient Address</label>
                <input
                  type="text"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient wallet address"
                  className="w-full p-2 rounded-md bg-dark-brown border border-gold/50 text-light-gold placeholder-warm-gray focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-warm-gray mb-1">Amount</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount of BULL"
                  className="w-full p-2 rounded-md bg-dark-brown border border-gold/50 text-light-gold placeholder-warm-gray focus:outline-none focus:ring-2 focus:ring-gold"
                  min="0"
                  step="any"
                />
              </div>
              <button
                onClick={handleSendTokens}
                className="w-full bg-gold text-dark-brown py-2 rounded-md font-semibold hover:bg-light-gold transition-colors flex items-center justify-center gap-2"
                disabled={sending}
              >
                {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                {sending ? 'Sending...' : 'Send Tokens'}
              </button>
              {message && (
                <p className={`text-center text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
              )}
            </div>
          </div>
        </div>
      );
    } else if (activeTab === 'transfers') {
      if (loadingTransactions) {
        return (
          <div className="animate-pulse">
            <div className="bg-gray-700 h-8 w-1/3 mb-4 rounded"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-dark-brown rounded-lg shadow-md">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider"><div className="h-4 bg-gray-600 rounded w-2/3"></div></th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider"><div className="h-4 bg-gray-600 rounded w-1/2"></div></th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider"><div className="h-4 bg-gray-600 rounded w-2/3"></div></th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider"><div className="h-4 bg-gray-600 rounded w-1/3"></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/20">
                  {[...Array(transactionsPerPage)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-light-gold"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-warm-gray"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-warm-gray"><div className="h-4 bg-gray-700 rounded w-2/3"></div></td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gold"><div className="h-4 bg-gray-700 rounded w-1/3"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        );
      }

      const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
      const startIndex = (currentPage - 1) * transactionsPerPage;
      const endIndex = Math.min(startIndex + transactionsPerPage, totalTransactions);
      const currentRangeText = totalTransactions === 0 ? "0" : `${startIndex + 1}-${endIndex}`;

      // Filter transactions based on search query
      const filteredTransactions = transactions.filter(tx => 
        tx.signature.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gold text-center mb-4">Recent Transfers</h3>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <input
              type="text"
              placeholder="Search by signature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-1/2 p-2 rounded-md bg-dark-brown border border-gold/50 text-light-gold placeholder-warm-gray focus:outline-none focus:ring-2 focus:ring-gold"
            />
                  <div className="flex items-center gap-2">
              <label htmlFor="transactionsPerPage" className="text-warm-gray text-sm">Show:</label>
                    <select
                id="transactionsPerPage"
                      value={transactionsPerPage}
                onChange={(e) => setTransactionsPerPage(Number(e.target.value))}
                className="bg-dark-brown border border-gold/50 text-light-gold rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

          {filteredTransactions.length === 0 && !loadingTransactions ? (
            <p className="text-warm-gray text-center">No transfers found.</p>
          ) : (
                <div className="overflow-x-auto">
              <table className="min-w-full bg-dark-brown rounded-lg shadow-md">
                    <thead>
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider">Signature</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-warm-gray uppercase tracking-wider">Link</th>
                      </tr>
                    </thead>
                <tbody className="divide-y divide-gold/20">
                      {filteredTransactions.map((tx) => (
                    <tr key={tx.signature} className="hover:bg-dark-red/20 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-light-gold">
                        {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
                        <button
                          onClick={() => handleCopy(tx.signature)}
                          className="ml-2 text-gold hover:text-light-gold transition-colors"
                          title="Copy transaction signature"
                        >
                          <FaCopy className="h-3 w-3" />
                        </button>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-warm-gray">
                        {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString('en-US') + ' ' + new Date(tx.timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-warm-gray">
                        {tx.amount}
                          </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gold">
                        <a href={tx.link} target="_blank" rel="noopener noreferrer" className="hover:underline">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                className="bg-gold text-dark-brown px-4 py-2 rounded-md font-semibold hover:bg-light-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
                  </button>
              <span className="text-warm-gray text-sm">
                Page {currentPage} of {totalPages} ({currentRangeText} of {totalTransactions} transfers)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-gold text-dark-brown px-4 py-2 rounded-md font-semibold hover:bg-light-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

            {message && (
            <p className={`text-center text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto border border-gold mb-6">
      <div className="flex justify-center mb-4">
        <button
          className={`px-6 py-2 rounded-l-lg font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-gold text-dark-brown' : 'bg-dark-red/50 text-warm-gray hover:bg-dark-red/70'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-6 py-2 rounded-r-lg font-semibold transition-colors ${activeTab === 'transfers' ? 'bg-gold text-dark-brown' : 'bg-dark-red/50 text-warm-gray hover:bg-dark-red/70'}`}
          onClick={() => setActiveTab('transfers')}
        >
          Transfers ({totalTransactions})
        </button>
      </div>
      {renderTabContent()}
      <style jsx global>{`
        /* For Webkit browsers (Chrome, Safari) */
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: #1a0f0f; /* Dark brown background */
          border-radius: 10px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #D4AF37; /* Gold thumb */
          border-radius: 10px;
          border: 2px solid #1a0f0f; /* Dark brown border */
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #e6b840; /* Lighter gold on hover */
        }

        /* For Firefox */
        .overflow-x-auto {
          scrollbar-width: thin; /* "auto" or "none" */
          scrollbar-color: #D4AF37 #1a0f0f; /* thumb color track color */
        }
      `}</style>
    </div>
  );
} 