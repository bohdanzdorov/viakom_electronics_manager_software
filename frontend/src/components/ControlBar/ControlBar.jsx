import React from 'react';
import './ControlBar.css';

const ControlBar = ({
  selectedFile,
  inputText,
  isLoading,
  onFileChange,
  onTextChange,
  onSearch,
  onTextSearch,
  onExportPDF,
  onExportExcel
}) => {
  return (
    <section className="control-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="upload-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span className="upload-label">Upload File:</span>
        <label className="file-input-wrapper">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
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
