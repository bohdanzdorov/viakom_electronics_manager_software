import React from 'react';
import './ProviderRow.css';

const parsePrice = (priceStr) => {
  if (!priceStr || priceStr === 'N/A') return NaN;
  const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
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

const calculateCoeffUahPrice = (priceStr, coefficient, exchangeRate) => {
  const price = parsePrice(priceStr);
  if (isNaN(price)) return 'N/A';
  const uahMultiplier = exchangeRate?.rate || 40.0; // fallback just in case
  return `${(price * (coefficient || 1) * uahMultiplier).toFixed(2)} \u20B4`; 
};

const ProviderRow = ({ providerName, providerData, requestedQuantity, coefficient, exchangeRate }) => {
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
      <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee'}}>
        {calculateCoeffUahPrice(providerData?.price, coefficient, exchangeRate)}
      </td>
    </tr>
  );
};

export default ProviderRow;
