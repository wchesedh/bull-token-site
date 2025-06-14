export default function TokenPrice({ token }) {
  if (!token) return null;

  return (
    <div className="bg-dark-brown rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto text-center border border-gold mt-6">
      <h2 className="text-xl font-bold text-gold mb-4">Market Data</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Price</p>
          <p className="text-lg font-semibold text-light-gold">${token.price.toFixed(4)}</p>
          <p className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h}%
          </p>
        </div>
        
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Market Cap</p>
          <p className="text-lg font-semibold text-light-gold">${token.marketCap}</p>
          <p className="text-xs text-warm-gray">Based on total supply</p>
        </div>
        
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">24h Volume</p>
          <p className="text-lg font-semibold text-light-gold">${token.volume24h}</p>
          <p className="text-xs text-warm-gray">Last 24 hours</p>
        </div>
        
        <div className="bg-dark-red/30 p-3 rounded-lg">
          <p className="text-xs text-warm-gray mb-1">Liquidity</p>
          <p className="text-lg font-semibold text-light-gold">${token.liquidity}</p>
          <p className="text-xs text-warm-gray">Total liquidity</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <a 
          href="https://axiom.trade/swap?inputCurrency=sol&outputCurrency=BnNFoHtJRaV1grpDxLWm8rhhDRt4vC9arpVGgcCYpump"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gold text-dark-brown px-4 py-2 rounded-lg font-bold hover:bg-light-gold transition"
        >
          Buy on Axiom
        </a>
        <a 
          href="https://jup.ag/swap/SOL-BULL"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-dark-red text-light-gold px-4 py-2 rounded-lg font-bold hover:bg-gold hover:text-dark-brown transition"
        >
          Buy on Jupiter
        </a>
      </div>
    </div>
  );
} 