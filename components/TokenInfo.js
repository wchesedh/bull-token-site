export default function TokenInfo({ token }) {
  if (!token) return <p className="text-red-500">Token data unavailable</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl mx-auto text-center">
      <img src={token.image} alt="Bull Token" className="w-32 h-32 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-800">{token.name}</h1>
      <h2 className="text-xl text-gray-600 mb-2">({token.symbol})</h2>
      <p className="text-sm text-gray-500">{token.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <p className="font-semibold">Total Supply</p>
          <p>Coming Soon</p>
        </div>
        <div>
          <p className="font-semibold">Holders</p>
          <p>Coming Soon</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Mint: BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump
      </p>
    </div>
  );
}
