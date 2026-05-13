const ExcelJS = require('exceljs');

/**
 * Parses an uploaded Excel file to extract component names and quantities.
 * Assumes Column 1 is the Component Name/MPN and Column 2 is the Quantity.
 * Row 1 is treated as a header.
 */
const parseExcel = async (filePath) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Get the primary worksheet (usually the first one)
    const worksheet = workbook.worksheets[0]; 
    const components = [];

    worksheet.eachRow((row, rowNumber) => {
        // Skip the header row
        if (rowNumber === 1) return; 
        
        // Extract values from Column A (1) and Column B (2)
        const nameCell = row.getCell(1).value;
        const qtyCell = row.getCell(2).value;

        // Clean up data
        // Sometimes ExcelJS returns formulas/objects for cells, so we check for objects
        const name = nameCell?.text ? nameCell.text : nameCell?.toString();
        const quantityText = qtyCell?.toString();

        if (name) {
            components.push({
                name: name.trim(),
                quantity: quantityText ? parseInt(quantityText.trim(), 10) : 1
            });
        }
    });

    return components;
};

module.exports = { parseExcel };
