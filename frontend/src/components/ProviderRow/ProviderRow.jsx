import React from 'react';
import './ProviderRow.css';

const parsePrice = (priceStr) => {
  if (!priceStr || priceStr === 'N/A') return NaN;
  const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
};

const calculateTotal = (priceStr, quantity) => {
  const price = parsePrice(priceStr);
  if (isNaN(price)) return 'N/A';
  return `$${(price * quantity).toPrecision(4)}`;
};

const displayPrice = (priceStr) => {
  const price = parsePrice(priceStr);
  if (isNaN(price)) return 'N/A';
  return `$${price}`; 
};

const calculateCoeffPrice = (priceStr, coefficient) => {
  const price = parsePrice(priceStr);
  if (isNaN(price)) return 'N/A';
  return `$${(price * (coefficient || 1)).toFixed(4)}`; 
};

const ProviderRow = ({ providerName, providerData, requestedQuantity, coefficient }) => {
  const inStock = providerData?.inStock || '0';
  const isStockLow = parseInt(inStock) < requestedQuantity;
  const url = providerData?.url;
  const hasUrl = url && url !== 'N/A';

  return (
    <tr>
      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        {hasUrl ? <a href={url} target="_blank" rel="noreferrer">{providerName}</a> : providerName}
      </td>
      <td className={`center-col ${isStockLow ? 'stock-low' : 'stock-ok'}`} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        {inStock}
      </td>
      <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        {displayPrice(providerData?.price)}
      </td>
      <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        {calculateCoeffPrice(providerData?.price, coefficient)}
      </td>
      <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        {calculateTotal(providerData?.price, requestedQuantity)}
      </td>
      <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        {hasUrl ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button type="button" onClick={() => navigator.clipboard.writeText(url)} style={{ padding: '2px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>Copy Link</button>
          </div>
        ) : '-'}
      </td>
    </tr>
  );
};

export default ProviderRow;
