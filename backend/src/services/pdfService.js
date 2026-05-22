const fs = require('fs');
const PDFParser = require('pdf2json');

const parsePdf = (filePath) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", errData => {
            console.error("PDF Parsing Error:", errData.parserError);
            reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            const components = [];
            
            pdfData.Pages.forEach(page => {
                const rowMap = {};
                
                page.Texts.forEach(t => {
                    let text = t.R[0].T;
                    try {
                        text = decodeURIComponent(text);
                    } catch (e) {
                        try {
                            text = decodeURI(text);
                        } catch (err) {
                            console.error("Failed to decode text:", text, "Error:", err.message);
                        }
                    }
                    const y = Math.round(t.y * 2) / 2; // Group items with similar Y
                    
                    if (!rowMap[y]) rowMap[y] = [];
                    rowMap[y].push({ x: t.x, text });
                });
                
                let boundaries = [];
                let nameColIndex = -1;
                let qtyColIndex = -1;
                
                const sortedY = Object.keys(rowMap).sort((a, b) => parseFloat(a) - parseFloat(b));
                
                sortedY.forEach(y => {
                    const items = rowMap[y].sort((a, b) => a.x - b.x);
                    const texts = items.map(i => i.text.trim());
                    
                    // Identify header row
                    // Looking for "Найменування" (\u041D\u0430\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u043D\u043D\u044F) 
                    // and "Кільк" (\u041A\u0456\u043B\u044C\u043A)
                    if (texts.some(t => t.includes('\u041D\u0430\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u043D\u043D\u044F')) && texts.some(t => t.includes('\u041A\u0456\u043B\u044C\u043A'))) {
                        boundaries = [];
                        
                        // Calculate midpoint boundaries between columns
                        items.forEach((item, index) => {
                            if (index === 0) {
                                boundaries.push({ start: 0, end: Infinity, label: item.text.trim() });
                            } else {
                                const midpoint = (items[index - 1].x + item.x) / 2;
                                boundaries[index - 1].end = midpoint;
                                boundaries.push({ start: midpoint, end: Infinity, label: item.text.trim() });
                            }
                        });
                        
                        boundaries.forEach((b, index) => {
                            if (b.label.includes('\u041D\u0430\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u043D\u043D\u044F')) nameColIndex = index;
                            if (b.label.includes('\u041A\u0456\u043B\u044C\u043A')) qtyColIndex = index;
                        });
                        return; // Done with header row
                    }
                    
                    // Process data rows
                    if (nameColIndex !== -1 && qtyColIndex !== -1 && boundaries.length > 0) {
                        let name = "";
                        let quantity = null;
                        
                        items.forEach(item => {
                            const text = item.text.trim();
                            if (!text) return;
                            
                            const colIndex = boundaries.findIndex(b => item.x >= b.start && item.x < b.end);
                            
                            if (colIndex === nameColIndex) {
                                name += (name ? " " : "") + text;
                            } else if (colIndex === qtyColIndex) {
                                const qtyMatch = text.match(/^(\d+)/);
                                if (qtyMatch) {
                                    quantity = parseInt(qtyMatch[1], 10);
                                }
                            }
                        });
                        
                        name = name.trim();
                        if (name && quantity !== null && quantity > 0) {
                            // Filter out labels indicating "do not install" ("не встановлювати" / \u043D\u0435 \u0432\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u044E\u0432\u0430\u0442\u0438)
                            if (!name.toLowerCase().includes('\u043D\u0435 \u0432\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u044E\u0432\u0430\u0442\u0438')) {
                                components.push({ name, quantity });
                            }
                        }
                    }
                });
            });
            
            resolve(components);
        });

        pdfParser.loadPDF(filePath);
    });
};

module.exports = { parsePdf };