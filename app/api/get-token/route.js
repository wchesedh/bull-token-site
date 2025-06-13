import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const RPC_URL = process.env.RPC_URL;
const MINT_ADDRESS = 'BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump';

console.log("🔑 RPC_URL from env:", RPC_URL);

export async function GET() {
  try {
    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);
    const mintPublicKey = new PublicKey(MINT_ADDRESS);

    // 🔍 Fetch NFT metadata and ensure JSON is loaded
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey, loadJsonMetadata: true });

    console.log("📦 NFT metadata URI:", nft.uri);
    console.log("🧾 JSON metadata content:", nft.json);
    console.log("🔍 Full NFT object:", JSON.stringify(nft, null, 2));

    // 🧮 Total supply
    const supplyInfo = await connection.getTokenSupply(mintPublicKey);
    const totalSupply = supplyInfo?.value?.uiAmountString || 'N/A';

    // 👥 Count holders with non-zero balances
    const largestAccounts = await connection.getTokenLargestAccounts(mintPublicKey);
    const holders = largestAccounts?.value?.filter(acc => parseFloat(acc.uiAmount) > 0).length || 0;

    // Add more detailed response for debugging
    const response = {
      name: nft.name,
      symbol: nft.symbol,
      description: nft.json?.description || 'No description found',
      image: nft.json?.image || '',
      totalSupply,
      holders,
      mint: MINT_ADDRESS,
      debug: {
        hasJson: !!nft.json,
        jsonKeys: nft.json ? Object.keys(nft.json) : [],
        uri: nft.uri
      }
    };

    console.log("📤 Response object:", JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (err) {
    console.error('❌ API Error:', err);
    console.error('❌ Error stack:', err.stack);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch token metadata.' },
      { status: 500 }
    );
  }
}
