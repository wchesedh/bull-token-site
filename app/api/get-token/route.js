import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const RPC_URL = process.env.RPC_URL;
const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';

export async function GET() {
  try {
    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);
    const mintPublicKey = new PublicKey(MINT_ADDRESS);

    // 🔍 Fetch NFT metadata and ensure JSON is loaded
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey, loadJsonMetadata: true });

    console.log("📦 NFT metadata URI:", nft.uri);
    console.log("🧾 JSON metadata content:", nft.json);

    // 🧮 Total supply
    const supplyInfo = await connection.getTokenSupply(mintPublicKey);
    const totalSupply = supplyInfo?.value?.uiAmountString || 'N/A';

    // 👥 Count holders with non-zero balances
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
