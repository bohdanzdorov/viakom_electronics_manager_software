import { useState } from 'react';
import './ControlBar.css';

const DEFAULT_COEFFS = { mouser: 1.5, tme: 1.5, digikey: 1.5 };

const ControlBar = ({
  selectedFile,
  inputText,
  isLoading,
  coefficients,
  onCoefficientsChange,
  onFileChange,
  onTextChange,
  onSearch,
  onTextSearch,
  onExportPDF,
  onExportExcel
}) => {
  const [localCoeffs, setLocalCoeffs] = useState(coefficients || DEFAULT_COEFFS);
  const [prevCoefficients, setPrevCoefficients] = useState(coefficients);

  if (coefficients !== prevCoefficients) {
    setPrevCoefficients(coefficients);
    if (coefficients) {
      setLocalCoeffs(coefficients);
    }
  }

  const handleCoeffChange = (e, provider) => {
    setLocalCoeffs({ ...localCoeffs, [provider]: parseFloat(e.target.value) });
  };

  const handleSaveCoeffs = () => {
    if (onCoefficientsChange) {
      onCoefficientsChange(localCoeffs);
    }
  };

  return (
    <section className="control-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Managers Coefficients Section */}
      <div className="coefficients-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', width: '100%', flexWrap: 'wrap' }}>
        <span className="upload-label">Managers Coefficients:</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>Mouser:</span>
            <input type="number" step="0.1" value={localCoeffs.mouser} onChange={(e) => handleCoeffChange(e, 'mouser')} style={{ width: '60px', padding: '0.25rem' }} />
          </label>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>TME:</span>
            <input type="number" step="0.1" value={localCoeffs.tme} onChange={(e) => handleCoeffChange(e, 'tme')} style={{ width: '60px', padding: '0.25rem' }} />
          </label>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>DigiKey:</span>
            <input type="number" step="0.1" value={localCoeffs.digikey} onChange={(e) => handleCoeffChange(e, 'digikey')} style={{ width: '60px', padding: '0.25rem' }} />
          </label>
          <button className="btn btn-outline" onClick={handleSaveCoeffs} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Save Rates</button>
        </div>
      </div>

      <div className="upload-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span className="upload-label">Upload File:</span>
        <label className="file-input-wrapper">
          <input 
            type="file" 
            accept=".xlsx, .xls, .pdf" 
            onChange={onFileChange} 
            className="file-input"
          />
          <span className="file-input-btn">Browse...</span>
          <span className="file-name" title={selectedFile ? selectedFile.name : 'No file selected'}>
            {selectedFile ? selectedFile.name : 'No file selected'}
          </span>
        </label>
        
        <button 
          className="btn btn-primary search-btn" 
          onClick={onSearch}
          disabled={!selectedFile || isLoading}
        >
          {isLoading && selectedFile ? "Searching..." : "Search File"}
        </button>
      </div>

      <div className="text-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        <span className="upload-label">Or paste text directly:</span>
        <textarea 
          placeholder="Paste components here... (e.g. ВИЛКА 5750913-7 TE Connectivity - 3шт.)"
          value={inputText}
          onChange={onTextChange}
          rows={4}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button 
          className="btn btn-primary search-btn" 
          onClick={onTextSearch}
          disabled={!inputText.trim() || isLoading}
          style={{ alignSelf: 'flex-start' }}
        >
          {isLoading && inputText.trim() ? "Extract & Search..." : "Extract Text & Search"}
        </button>
      </div>
      
      <div className="export-controls" style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
        <button className="btn btn-outline" onClick={onExportPDF}>
          Export PDF
        </button>
        <button className="btn btn-outline" onClick={onExportExcel}>
          Export Excel
        </button>
      </div>
    </section>
  );
};

export default ControlBar;
