import React from 'react';
import ResultTable from '../ResultTable/ResultTable';
import './ResultCard.css';

const ResultCard = ({ item }) => {
  return (
    <div className="component-result-card" style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
      <div className="component-result-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{item.name} - {item.requestedQuantity}stk.</h3>
      </div>
      <ResultTable item={item} />
    </div>
  );
};

export default ResultCard;
