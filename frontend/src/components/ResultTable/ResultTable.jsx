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
          <ProviderRow 
            providerName="Mouser" 
            providerData={item.mouser} 
            requestedQuantity={item.requestedQuantity} 
          />
          <ProviderRow 
            providerName="TME.eu" 
            providerData={item.tme} 
            requestedQuantity={item.requestedQuantity} 
          />
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
