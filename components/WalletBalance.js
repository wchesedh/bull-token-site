'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createTransferInstruction } from '@solana/spl-token';

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
    if (publicKey && publicKey.toBase58() === TEST_CONNECTED_WALLET) {
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

      const signatures = await connection.getSignaturesForAddress(
        associatedTokenAccount,
        { limit: 1000 } // Adjust this limit based on your needs
      );
      setAllSignatures(signatures);
      setTotalTransactions(signatures.length);
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

        // Fetch transactions if test wallet is connected
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

      const fromTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        publicKey
      );
      const toTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        recipientPublicKey
      );

      const fromAccountInfo = await connection.getAccountInfo(fromTokenAccount);
      if (!fromAccountInfo) {
        setMessage('You do not have an associated token account for Bull Token.');
        setIsError(true);
        setSending(false);
        return;
      }

      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        parseFloat(amount) * (10 ** TOKEN_DECIMALS)
      );

      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });

      setMessage(`Transaction sent: ${signature}`);
      setAmount('');
      // Refresh transactions after sending
      if (publicKey.toBase58() === TEST_CONNECTED_WALLET) {
        await fetchAllSignatures();
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error sending tokens:", error);
      setMessage(`Failed to send tokens: ${error.message}`);
      setIsError(true);
    } finally {
      setSending(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchQuery.toLowerCase();
    return (
      tx.signature.toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchLower) ||
      new Date(tx.timestamp * 1000).toLocaleString().toLowerCase().includes(searchLower)
    );
  });

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
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-warm-gray">Show</span>
                    <select
                      value={transactionsPerPage}
                      onChange={(e) => {
                        setTransactionsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-dark-brown border border-gold text-light-gold rounded-md px-2 py-1 text-sm focus:outline-none focus:border-gold"
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <span className="text-warm-gray">per page</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-dark-brown border border-gold text-light-gold rounded-md pl-8 pr-4 py-1 text-sm focus:outline-none focus:border-gold w-48"
                    />
                    <svg
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
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
                      {filteredTransactions.map((tx) => (
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
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md font-semibold ${
                      currentPage === 1
                        ? 'bg-warm-gray text-dark-brown cursor-not-allowed'
                        : 'bg-dark-red text-light-gold hover:bg-gold hover:text-dark-brown'
                    }`}
                    aria-label="Previous page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-warm-gray">Page</span>
                    <select
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="bg-dark-brown border border-gold text-light-gold rounded-md px-2 py-1 text-sm focus:outline-none focus:border-gold"
                    >
                      {Array.from({ length: Math.ceil(totalTransactions / transactionsPerPage) }, (_, i) => i + 1).map(page => (
                        <option key={page} value={page}>{page}</option>
                      ))}
                    </select>
                    <span className="text-warm-gray">of {Math.ceil(totalTransactions / transactionsPerPage)}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalTransactions / transactionsPerPage)}
                    className={`p-2 rounded-md font-semibold ${
                      currentPage >= Math.ceil(totalTransactions / transactionsPerPage)
                        ? 'bg-warm-gray text-dark-brown cursor-not-allowed'
                        : 'bg-dark-red text-light-gold hover:bg-gold hover:text-dark-brown'
                    }`}
                    aria-label="Next page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </>
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