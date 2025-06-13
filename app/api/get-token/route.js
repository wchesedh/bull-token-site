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

    // ✅ Get metadata using Metaplex
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

    // ✅ Get total supply
    const supplyInfo = await connection.getTokenSupply(mintPublicKey);
    const totalSupply = supplyInfo?.value?.uiAmountString || 'N/A';

    // ✅ Get non-zero token holder accounts
    const largestAccounts = await connection.getTokenLargestAccounts(mintPublicKey);
    const holders = largestAccounts?.value?.filter(acc => parseFloat(acc.uiAmount) > 0).length || 0;

    return NextResponse.json({
      name: nft.name,
      symbol: nft.symbol,
      description: nft.json?.description || 'No description found',
      image: nft.json?.image || '',
      totalSupply,
      holders,
      mint: MINT_ADDRESS,
    });
  } catch (err) {
    console.error('❌ API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch token metadata.' },
      { status: 500 }
    );
  }
}
