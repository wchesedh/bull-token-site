import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=e7b21d8b-e18f-4eb8-b122-f5f0deb7a4e0';
const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';

export async function GET() {
  try {
    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);

    const mintPublicKey = new PublicKey(MINT_ADDRESS);

    // This fetches metadata (on-chain + off-chain)
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

    return NextResponse.json({
      name: nft.name,
      symbol: nft.symbol,
      description: nft.json?.description || 'No description found',
      image: nft.json?.image || '',
    });
  } catch (err) {
    console.error('❌ API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch token metadata.' },
      { status: 500 }
    );
  }
}
