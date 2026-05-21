import { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import ControlBar from './components/ControlBar/ControlBar';
import ResultCard from './components/ResultCard/ResultCard';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coefficients, setCoefficients] = useState({ mouser: 1.5, tme: 1.5, digikey: 1.5 });

  useEffect(() => {
    const fetchCoefficients = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_LINK}api/coefficients`);
        if (response.ok) {
          const data = await response.json();
          setCoefficients(data);
        }
      } catch (err) {
        console.error("Failed to fetch initial coefficients:", err);
      }
    };
    fetchCoefficients();
  }, []);

  const handleCoefficientsChange = async (newCoeffs) => {
    setCoefficients(newCoeffs);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_LINK}api/coefficients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoeffs)
      });
    } catch (err) {
      console.error("Failed to save coefficients:", err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSearch = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadUrl = `${import.meta.env.VITE_BACKEND_LINK}api/components/upload` || 'http://localhost:3000/api/components/upload';

      const response = await fetch(uploadUrl, {
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

  const handleTextSearch = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create endpoint dynamically based on the base upload link's origin
      const baseApiUrl = (`${import.meta.env.VITE_BACKEND_LINK}api/components/upload` || 'http://localhost:3000/api/components/upload').replace('/upload', '');
      const parseUrl = `${baseApiUrl}/parse-text`;

      const response = await fetch(parseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to parse text and fetch components. Status: ${response.status}`);
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

  return (
    <div className="app-wrapper">
      <Header />

      <main className="container main-content">
        {/* Control Bar (Upload & Actions) */}
        <ControlBar
          selectedFile={selectedFile}
          inputText={inputText}
          isLoading={isLoading}
          coefficients={coefficients}
          onCoefficientsChange={handleCoefficientsChange}
          onFileChange={handleFileChange}
          onTextChange={handleTextChange}
          onSearch={handleSearch}
          onTextSearch={handleTextSearch}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        {error && <div className="error-message">{error}</div>}

        {/* Results Section */}
        <section className="results-section">
          <div className="results-list">
            {results.length > 0 ? (
              results.map((item, index) => (
                <ResultCard key={index} item={item} coefficients={coefficients} />
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
