import React from 'react';
import './ControlBar.css';

const ControlBar = ({
  selectedFile,
  isLoading,
  onFileChange,
  onSearch,
  onExportPDF,
  onExportExcel
}) => {
  return (
    <section className="control-bar">
      <div className="upload-group">
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
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
      
      <div className="export-controls">
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
