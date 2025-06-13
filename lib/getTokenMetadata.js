import { Connection, PublicKey } from '@solana/web3.js';

const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=e7b21d8b-e18f-4eb8-b122-f5f0deb7a4e0';
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function convertToGateway(uri) {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  }
  if (uri.includes("ipfs.io")) {
    return uri.replace("https://ipfs.io", "https://cloudflare-ipfs.com");
  }
  return uri;
}

export async function getTokenMetadata(mintAddress) {
  const connection = new Connection(SOLANA_RPC);
  const mintPublicKey = new PublicKey(mintAddress);

  const [metadataPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const accountInfo = await connection.getAccountInfo(metadataPDA);
  if (!accountInfo || !accountInfo.data) {
    throw new Error("Token metadata account not found or inaccessible.");
  }

  const uriMatch = accountInfo.data.toString().match(/https:\/\/[^\s"]+/);
  const rawUri = uriMatch?.[0]?.trim().replace(/\u0000/g, '');
  const gatewayUri = convertToGateway(rawUri);

  const res = await fetch(gatewayUri);
  const json = await res.json();

  return {
    name: json.name,
    symbol: json.symbol,
    description: json.description,
    image: convertToGateway(json.image),
  };
}
