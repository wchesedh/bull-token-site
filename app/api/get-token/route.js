import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=c0f65256-6df0-4e3c-aa5e-68dbb50ece42';
const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export async function GET() {
  try {
    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);
    const mintPublicKey = new PublicKey(MINT_ADDRESS);

    // Get metadata using Metaplex
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

    // Get total supply
    const supplyInfo = await connection.getTokenSupply(mintPublicKey);
    const totalSupply = supplyInfo?.value?.uiAmountString || 'N/A';

    // Get metadata with fallbacks
    const metadata = nft.json || {};
    const image = '/images/default-token.png';
    const description = metadata.description || 'A bullisch journey';

    // Calculate market data
    const price = 0.0001;
    const marketCap = (parseFloat(totalSupply) * price).toFixed(2);
    const volume24h = (parseFloat(totalSupply) * 0.1 * price).toFixed(2);
    const liquidity = (parseFloat(totalSupply) * 0.05 * price).toFixed(2);

    // Get token accounts using getTokenLargestAccounts
    const largestAccounts = await connection.getTokenLargestAccounts(mintPublicKey);
    
    const allHolders = largestAccounts.value
      .filter(acc => parseFloat(acc.uiAmount) > 0 && acc.address.toString() !== TOKEN_PROGRAM_ID)
      .map(acc => ({
        address: acc.address.toString(), // Token Account Address
        uiAmount: acc.uiAmount, // UI amount
        owner: acc.owner ? acc.owner.toString() : acc.address.toString() // Use owner if available, otherwise token account address
      }))
      .sort((a, b) => parseFloat(b.uiAmount) - parseFloat(a.uiAmount));

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
      allHolders,
    });
  } catch (err) {
    console.error('❌ API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch token metadata.' },
      { status: 500 }
    );
  }
}