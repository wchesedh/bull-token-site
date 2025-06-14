import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=c0f65256-6df0-4e3c-aa5e-68dbb50ece42';
const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';

// Cache for holders data
let holdersCache = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 300000; // 5 minutes cache

export async function GET() {
  try {
    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);
    const mintPublicKey = new PublicKey(MINT_ADDRESS);

    // ✅ Get metadata using Metaplex
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

    // ✅ Get total supply
    const supplyInfo = await connection.getTokenSupply(mintPublicKey);
    const totalSupply = supplyInfo?.value?.uiAmountString || 'N/A';

    // Get metadata with fallbacks
    const metadata = nft.json || {};
    const image = '/images/default-token.png' || '/images/default-token.png';
    const description = metadata.description || 'A bullisch journey';

    // Calculate market data
    const price = 0.0001; // This should be fetched from a price API in production
    const marketCap = (parseFloat(totalSupply) * price).toFixed(2);
    const volume24h = (parseFloat(totalSupply) * 0.1 * price).toFixed(2);
    const liquidity = (parseFloat(totalSupply) * 0.05 * price).toFixed(2);

    // Get holders data (with caching)
    let allHolders = [];
    const now = Date.now();

    if (holdersCache.data && (now - holdersCache.timestamp) < CACHE_DURATION) {
      allHolders = holdersCache.data;
    } else {
      try {
        // Get all token accounts for this mint
        const accounts = await connection.getTokenLargestAccounts(mintPublicKey);
        
        // Process holders data
        allHolders = await Promise.all(
          accounts.value
            .filter(acc => parseFloat(acc.uiAmount) > 0)
            .map(async (acc) => {
              try {
                const tokenAccount = await getAccount(
                  connection,
                  new PublicKey(acc.address)
                );
                
                return {
                  address: acc.address,
                  uiAmount: acc.uiAmount,
                  owner: tokenAccount.owner.toString()
                };
              } catch (error) {
                console.error('Error getting token account:', error);
                return null;
              }
            })
        );

        // Filter out null values and sort
        allHolders = allHolders
          .filter(holder => holder !== null)
          .sort((a, b) => parseFloat(b.uiAmount) - parseFloat(a.uiAmount));

        // Update cache
        holdersCache = {
          data: allHolders,
          timestamp: now
        };
      } catch (error) {
        console.error('Error fetching holders:', error);
        // Use cached data if available, even if expired
        if (holdersCache.data) {
          allHolders = holdersCache.data;
        }
      }
    }

    return NextResponse.json({
      name: nft.name,
      symbol: nft.symbol,
      description,
      image,
      totalSupply,
      holders: allHolders.length,
      mint: MINT_ADDRESS,
      price,
      marketCap,
      volume24h,
      liquidity,
      priceChange24h: 2.5,
      allHolders
    });
  } catch (err) {
    console.error('❌ API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch token metadata.' },
      { status: 500 }
    );
  }
}