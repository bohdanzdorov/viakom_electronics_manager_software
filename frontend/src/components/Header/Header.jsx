import './Header.css';

const Header = ({ exchangeRate }) => (
  <header className="top-navbar">
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <h1>Viakom Electronics Manager's Software</h1>
      {exchangeRate?.rate && (
        <div style={{ fontSize: '1.1rem', fontWeight: '500', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px' }}>
          1$ = {exchangeRate.rate.toFixed(2)} ₴ <span style={{fontSize: '0.8rem', opacity: 0.8}}>({exchangeRate.date})</span>
        </div>
      )}
    </div>
  </header>
);

export default Header;
