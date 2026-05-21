import React from 'react';
import ProviderRow from '../ProviderRow/ProviderRow';
import './ResultTable.css';

const parsePrice = (priceStr) => {
  if (!priceStr || priceStr === 'N/A') return NaN;
  const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
};

const ResultTable = ({ item, coefficients, exchangeRate }) => {
  const providers = Object.entries(item)
    .filter(([key, value]) => !['name', 'requestedQuantity', 'partNumber', 'quantity', 'matchStatus'].includes(key) && typeof value === 'object' && value !== null)
    .map(([providerKey, providerData]) => {
      const formattedName = providerKey === 'tme' ? 'TME.eu' : 
                            providerKey === 'digikey' ? 'DigiKey' : 
                            providerKey === 'tti' ? 'TTI Europe' :
                            providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
      return { providerKey, formattedName, providerData };
    });

  // Sort logically: In-Stock > Out-of-Stock > Not Found, then by Price
  providers.sort((a, b) => {
    const dataA = a.providerData;
    const dataB = b.providerData;

    const isMissing = (d) => !d?.url || d.url === 'N/A' || !d?.price || d.price === 'N/A';
    const missingA = isMissing(dataA);
    const missingB = isMissing(dataB);

    if (missingA !== missingB) return missingA ? 1 : -1;
    if (missingA && missingB) return 0;

    const stockA = parseInt(dataA.inStock || '0', 10);
    const stockB = parseInt(dataB.inStock || '0', 10);
    
    // Group 1: Fully in stock | Group 2: Partially in stock | Group 3: Out of stock
    const reqQ = item.requestedQuantity || 0;
    const rank = (stock) => {
      if (stock >= reqQ) return 1;
      if (stock > 0) return 2;
      return 3;
    };

    const rankA = rank(stockA);
    const rankB = rank(stockB);

    if (rankA !== rankB) return rankA - rankB;

    const coeffA = coefficients?.[a.providerKey] || 1.0;
    const coeffB = coefficients?.[b.providerKey] || 1.0;
    const priceA = parsePrice(dataA.price) * coeffA;
    const priceB = parsePrice(dataB.price) * coeffB;
    return (priceA || Infinity) - (priceB || Infinity);
  });

  return (
    <div className="table-responsive">
      <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: '8px' }}>Seller Name</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>In Stock Amount</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>Price (Unit)</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>Price w/ Coeff (Unit)</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>Price w/ Coeff (UAH)</th>
          </tr>
        </thead>
        <tbody>
          {providers.map(({ providerKey, formattedName, providerData }) => (
            <ProviderRow 
              key={providerKey}
              providerName={formattedName} 
              providerData={providerData} 
              requestedQuantity={item.requestedQuantity} 
              coefficient={coefficients?.[providerKey] || 1.0}
              exchangeRate={exchangeRate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
