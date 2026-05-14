import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Using localhost:3000 as defined in our backend
      const response = await fetch('http://localhost:3000/api/components/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload and fetch components. Status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.components || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    console.log("Exporting to PDF...");
    alert("PDF Export triggered!");
  };

  const handleExportExcel = () => {
    console.log("Exporting to Excel...");
    alert("Excel Export triggered!");
  };

  const parsePrice = (priceStr) => {
    if (!priceStr || priceStr === 'N/A') return NaN;
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned);
  };

  const calculateTotal = (priceStr, quantity) => {
    const price = parsePrice(priceStr);
    if (isNaN(price)) return 'N/A';
    return `$${(price * quantity).toPrecision(4)}`; // allowing 4 decimal places for total price
  };

  const displayPrice = (priceStr) => {
    const price = parsePrice(priceStr);
    if (isNaN(price)) return 'N/A';
    return `$${price}`; 
  };

  return (
    <div className="app-wrapper">
      <header className="top-navbar">
        <div className="container">
          <h1>Viakom Electronics Manager's Software</h1>
        </div>
      </header>

      <main className="container main-content">
        {/* Control Bar (Upload & Actions) */}
        <section className="control-bar">
          <div className="upload-group">
            <span className="upload-label">Upload File:</span>
            <label className="file-input-wrapper">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
                className="file-input"
              />
              <span className="file-input-btn">Browse...</span>
              <span className="file-name" title={selectedFile ? selectedFile.name : 'No file selected'}>
                {selectedFile ? selectedFile.name : 'No file selected'}
              </span>
            </label>
            
            <button 
              className="btn btn-primary search-btn" 
              onClick={handleSearch}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          
          <div className="export-controls">
            <button className="btn btn-outline" onClick={handleExportPDF}>
              Export PDF
            </button>
            <button className="btn btn-outline" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        {/* Results Section */}
        <section className="results-section">
          <div className="results-list">
            {results.length > 0 ? (
              results.map((item, index) => (
                <div key={index} className="component-result-card" style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                  <div className="component-result-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>{item.name} - {item.requestedQuantity}stk.</h3>
                  </div>
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
                        {/* Mouser Row */}
                        <tr>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.mouser?.url && item.mouser.url !== 'N/A' ? <a href={item.mouser.url} target="_blank" rel="noreferrer">Mouser</a> : 'Mouser'}
                          </td>
                          <td className={`center-col ${parseInt(item.mouser?.inStock || 0) < item.requestedQuantity ? 'stock-low' : 'stock-ok'}`} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.mouser?.inStock || '0'}
                          </td>
                          <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{displayPrice(item.mouser?.price)}</td>
                          <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {calculateTotal(item.mouser?.price, item.requestedQuantity)}
                          </td>
                          <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.mouser?.url && item.mouser.url !== 'N/A' ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button type="button" onClick={() => navigator.clipboard.writeText(item.mouser.url)} style={{ padding: '2px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>Copy Link</button>
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                        {/* TME Row */}
                        <tr>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.tme?.url && item.tme.url !== 'N/A' ? <a href={item.tme.url} target="_blank" rel="noreferrer">TME.eu</a> : 'TME.eu'}
                          </td>
                          <td className={`center-col ${parseInt(item.tme?.inStock || 0) < item.requestedQuantity ? 'stock-low' : 'stock-ok'}`} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.tme?.inStock || '0'}
                          </td>
                          <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{displayPrice(item.tme?.price)}</td>
                          <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {calculateTotal(item.tme?.price, item.requestedQuantity)}
                          </td>
                          <td className="center-col" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.tme?.url && item.tme.url !== 'N/A'? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button type="button" onClick={() => navigator.clipboard.writeText(item.tme.url)} style={{ padding: '2px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>Copy Link</button>
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No results to display. Upload a file and start searching.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
