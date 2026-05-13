import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Mock data to visualize the table before we implement the fetch logic
  const [results, setResults] = useState([
    {
      name: 'CD-12',
      requestedQuantity: 25,
      mouser: { inStock: '1450', price: '\.80', manufacturer: 'Amphenol' },
      tme: { inStock: '36', price: '\.95', manufacturer: 'AMPHENOL LTW' }
    },
    {
      name: 'LM71CIMFX/NOPB',
      requestedQuantity: 100,
      mouser: { inStock: '0', price: 'N/A', manufacturer: 'Texas Instruments' },
      tme: { inStock: '5000', price: '\.12', manufacturer: 'TEXAS INSTRUMENTS' }
    },
    {
      name: 'NE555P',
      requestedQuantity: 10,
      mouser: { inStock: '12050', price: '\.45', manufacturer: 'TI' },
      tme: { inStock: '0', price: 'N/A', manufacturer: 'TI' }
    }
  ]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSearch = () => {
    // Placeholder for actual fetch logic
    console.log("Searching components...");
    alert("Search triggered! (Fetch logic will be implemented here)");
  };

  const handleExportPDF = () => {
    console.log("Exporting to PDF...");
    alert("PDF Export triggered!");
  };

  const handleExportExcel = () => {
    console.log("Exporting to Excel...");
    alert("Excel Export triggered!");
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1>Viakom Component Manager</h1>
          <p>Automated Stock & Pricing Search across Mouser and TME.eu</p>
        </div>
      </header>

      <main className="main-content">
        {/* Upload Section */}
        <section className="card upload-section">
          <h2>1. Upload Bill of Materials (Excel)</h2>
          <p className="subtitle">Select an .xlsx file containing component names and quantities.</p>
          
          <div className="upload-controls">
            <label className="file-input-wrapper">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
                className="file-input"
              />
              <span className="file-input-btn">Browse Files</span>
              <span className="file-name">{selectedFile ? selectedFile.name : 'No file selected'}</span>
            </label>
            
            <button 
              className="btn btn-primary" 
              onClick={handleSearch}
              disabled={!selectedFile}
            >
              ?? Search Components
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="card results-section">
          <div className="results-header">
            <h2>2. Search Results</h2>
            <div className="export-controls">
              <button className="btn btn-outline" onClick={handleExportPDF}>
                ?? Export PDF
              </button>
              <button className="btn btn-outline" onClick={handleExportExcel}>
                ?? Export Excel
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="results-table">
              <thead>
                <tr>
                  <th rowSpan="2">Component Name</th>
                  <th rowSpan="2" className="center-col">Req. Qty</th>
                  <th colSpan="2" className="vendor-header mouser-header">Mouser</th>
                  <th colSpan="2" className="vendor-header tme-header">TME.eu</th>
                </tr>
                <tr className="subheader">
                  <th className="center-col">Stock</th>
                  <th className="center-col">Price (Unit)</th>
                  <th className="center-col">Stock</th>
                  <th className="center-col">Price (Unit)</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((item, index) => (
                    <tr key={index}>
                      <td className="font-medium">{item.name}</td>
                      <td className="center-col">{item.requestedQuantity}</td>
                      
                      {/* Mouser Columns */}
                      <td className={`center-col ${item.mouser.inStock < item.requestedQuantity ? 'stock-low' : 'stock-ok'}`}>
                        {item.mouser.inStock}
                      </td>
                      <td className="center-col">{item.mouser.price}</td>
                      
                      {/* TME Columns */}
                      <td className={`center-col ${item.tme.inStock < item.requestedQuantity ? 'stock-low' : 'stock-ok'}`}>
                        {item.tme.inStock}
                      </td>
                      <td className="center-col">{item.tme.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No results to display. Upload a file and start searching.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
