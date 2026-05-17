import React from 'react';
import ProviderRow from '../ProviderRow/ProviderRow';
import './ResultTable.css';

const ResultTable = ({ item }) => {
  return (
    <div className="table-responsive">
      <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: '8px' }}>Seller Name</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>In Stock Amount</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>Price (Unit)</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>Total Price</th>
            <th className="center-col" style={{ borderBottom: '2px solid #ddd', padding: '8px' }}>Product Link</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(item)
            .filter(([key, value]) => !['name', 'requestedQuantity', 'partNumber', 'quantity', 'matchStatus'].includes(key) && typeof value === 'object' && value !== null)
            .map(([providerKey, providerData]) => {
              // Format the provider name for display (e.g., 'mouser' -> 'Mouser', 'tme' -> 'Tme')
              const formattedName = providerKey === 'tme' ? 'TME.eu' : 
                                    providerKey === 'digikey' ? 'DigiKey' : 
                                    providerKey === 'tti' ? 'TTI Europe' :
                                    providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
                                    
              return (
                <ProviderRow 
                  key={providerKey}
                  providerName={formattedName} 
                  providerData={providerData} 
                  requestedQuantity={item.requestedQuantity} 
                />
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
