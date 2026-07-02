const { parseExcel } = require('../services/excelService');
const { parsePdf } = require('../services/pdfService');
const { searchMouser } = require('../services/mouserService');
const { searchTME } = require('../services/tmeService');
const { searchDigikey } = require('../services/digikeyService');
const { extractComponentsFromText } = require('../services/llmService');
const fs = require('fs');

const uploadAndSearch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExt = req.file.originalname.split('.').pop().toLowerCase();
        const mimeType = req.file.mimetype;

        let components = [];
        if (fileExt === 'pdf' || mimeType === 'application/pdf') {
            components = await parsePdf(filePath);
        } else {
            components = await parseExcel(filePath);
        }

        // 2. Call APIs
        const [mouserResults, tmeResults, digikeyResults] = await Promise.all([
            searchMouser(components),
            searchTME(components),
            searchDigikey(components)
        ]);

        // Cleanup the file from the 'uploads/' folder since we have the data in memory
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (cleanupError) {
            console.error(`Failed to delete file ${filePath}:`, cleanupError.message);
        }
        
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

        if (req.file) {
            try {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error(`Failed to delete file in catch block ${req.file.path}:`, cleanupError.message);
            }
        }

        res.status(500).json({ message: 'Internal server error processing file', error: error.message });
    }
};

const parseTextAndSearch = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'No text provided' });
        }

        // 1. Extract components from text using LLM
        const components = await extractComponentsFromText(text);

        if (!Array.isArray(components)) {
            return res.status(400).json({ message: 'Could not extract a valid component list from text.' });
        }

        const validComponents = components.filter(
            (component) => component && typeof component.name === 'string' && component.name.trim() !== ''
        );

        if (validComponents.length === 0) {
            return res.status(400).json({ message: 'Could not extract any components from the text provided.' });
        }

        // 2. Call APIs
        const [mouserResults, tmeResults, digikeyResults] = await Promise.all([
            searchMouser(validComponents),
            searchTME(validComponents),
            searchDigikey(validComponents)
        ]);

        // Merge results together
        const mergedResults = validComponents.map(comp => {
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
        console.error('Error in parseTextAndSearch:', error);
        res.status(500).json({ message: 'Internal server error processing text', error: error.message });
    }
};

const exportData = async (req, res) => {
    res.status(501).json({ message: 'Export not implemented yet' });
};

module.exports = {
    uploadAndSearch,
    parseTextAndSearch,
    exportData
};
