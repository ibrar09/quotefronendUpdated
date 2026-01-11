import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url'; // Required for ES Modules
import sequelize from '../config/db.js';
import PriceList from '../models/pricelists.js'; // Check if your file is pricelist.js or pricelists.js

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importCSV = async () => {
  const results = [];
  
  // Since CSV is in the SAME folder as this script, we use './'
  const filePath = path.join(__dirname, 'Alshaya FM -KSA Rate list Version 3.csv');

  console.log("Checking file at:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("❌ Error: File not found at the path above. Please check the filename.");
    process.exit(1);
  }

  fs.createReadStream(filePath)
    .pipe(csv({ 
      skipLines: 2 
    }))
    .on('data', (row) => {
      const cleanRow = {};
      Object.keys(row).forEach(key => {
        cleanRow[key.trim()] = row[key];
      });

      // Mapping CSV to Model
      results.push({
        code: cleanRow['CODE'],
        type: cleanRow['TYPE'],
        description: cleanRow['DECRIPTION'], 
        unit: cleanRow['UNIT'],
        material_price: parseFloat(cleanRow['Material \nPrice']) || 0,
        labor_price: parseFloat(cleanRow['Labor\nPrice ']) || 0,
        total_price: parseFloat(cleanRow['Total']) || 0,
        remarks: cleanRow['REMARKS'],
        comments: cleanRow['COMMENTS']
      });
    })
    .on('end', async () => {
      try {
        console.log(`Parsed ${results.length} items. Connecting to Database...`);
        
        await sequelize.sync(); 

        await PriceList.bulkCreate(results, {
          updateOnDuplicate: [
            'type', 'description', 'unit', 'material_price', 
            'labor_price', 'total_price', 'remarks', 'comments'
          ]
        });

        console.log('✅ Import Completed Successfully!');
        process.exit(0);
      } catch (err) {
        console.error('❌ Database Error:', err);
        process.exit(1);
      }
    });
};

importCSV();