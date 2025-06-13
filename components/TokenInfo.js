export default function TokenInfo({ token }) {
  if (!token) return <p className="text-red-500">Token data unavailable</p>;

  return (
    <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold">
      <img src={token.image} alt="Bull Token" className="w-32 h-32 mx-auto mb-4 border-2 border-light-gold rounded-full" />
      <h1 className="text-3xl font-bold text-gold">{token.name}</h1>
      <h2 className="text-xl text-warm-gray mb-2">({token.symbol})</h2>
      <p className="text-sm text-warm-gray">{token.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-light-gold">
        <div>
          <p className="font-semibold">Total Supply</p>
          <p>{token.totalSupply}</p>
        </div>
        <div>
          <p className="font-semibold">Holders</p>
          <p>{token.holders}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-warm-gray">
        Mint: BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump
      </p>
    </div>
  );
}
