const { parseExcel } = require('../services/excelService');
const { searchMouser } = require('../services/mouserService');
const { searchTME } = require('../services/tmeService');
const { searchDigikey } = require('../services/digikeyService');
const fs = require('fs');

const uploadAndSearch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 1. Parse the uploaded Excel file
        const components = await parseExcel(req.file.path);
        
        // 2. Call APIs
        const [mouserResults, tmeResults, digikeyResults] = await Promise.all([
            searchMouser(components),
            searchTME(components),
            searchDigikey(components)
        ]);
        
        // Cleanup the file from the 'uploads/' folder since we have the data in memory
        fs.unlinkSync(req.file.path);

        // Merge results together
        const mergedResults = components.map(comp => {
            const mouserData = mouserResults.find(m => m.name === comp.name)?.mouser || {};
            const tmeData = tmeResults.find(t => t.name === comp.name)?.tme || {};
            const digikeyData = digikeyResults.find(d => d.name === comp.name)?.digikey || {};
            
            return {
                name: comp.name,
                requestedQuantity: comp.quantity,
                mouser: mouserData,
                tme: tmeData,
                digikey: digikeyData
            };
        });

        // 3. Return unified data
        res.status(200).json({ 
            message: 'Search completed successfully',
            count: mergedResults.length,
            components: mergedResults 
        });
    } catch (error) {
        console.error('Error in uploadAndSearch:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: 'Internal server error processing file', error: error.message });
    }
};

const exportData = async (req, res) => {
    res.status(501).json({ message: 'Export not implemented yet' });
};

module.exports = {
    uploadAndSearch,
    exportData
};
