export default function TokenInfo({ token }) {
  if (!token) return <p className="text-red-500">Token data unavailable</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl mx-auto text-center">
      {/* ✅ Only render image if token.image exists and is not empty */}
      {token.image ? (
        <img src={token.image} alt="Bull Token" className="w-32 h-32 mx-auto mb-4" />
      ) : (
        <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          No image
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-800">{token.name}</h1>
      <h2 className="text-xl text-gray-600 mb-2">({token.symbol})</h2>
      <p className="text-sm text-gray-500">
        {token.description !== 'No description found' ? token.description : 'Description not available.'}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <p className="font-semibold">Total Supply</p>
          <p>{token.totalSupply}</p>
        </div>
        <div>
          <p className="font-semibold">Holders</p>
          <p>{token.holders}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Mint: {token.mint}
      </p>
    </div>
  );
}
