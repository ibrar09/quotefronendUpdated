import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';
import Store from '../models/store.js'; // Ensure path to Store.js is correct

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * HELPER: Validates and parses dates for PostgreSQL DATEONLY compatibility
 */
const parseDate = (dateStr) => {
    if (!dateStr || dateStr.trim() === '' || dateStr.includes('#N/A')) return null;
    const d = new Date(dateStr);
    // If Date is invalid (NaN), return null so DB doesn't crash
    return isNaN(d.getTime()) ? null : d;
};

/**
 * HELPER: Cleans numeric strings for DECIMAL compatibility
 */
const parseSqm = (val) => {
    if (!val || val.toString().includes('#N/A')) return 0;
    const cleaned = val.toString().replace(/,/g, '').trim();
    return parseFloat(cleaned) || 0;
};

/**
 * HELPER: Reads CSV and cleans invisible characters from headers
 */
const readCSV = (fileName, mappingFn) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            return reject(new Error(`File not found: ${filePath}`));
        }

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                const cleanRow = {};
                // Trims spaces and removes newlines from column headers
                Object.keys(data).forEach(key => {
                    const cleanKey = key.trim().replace(/\n/g, ' ');
                    cleanRow[cleanKey] = data[key];
                });
                results.push(mappingFn(cleanRow));
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};

async function run() {
    try {
        console.log('--- Starting Import Process ---');

        // 1. Load and Map EP.csv (Eastern Province)
        const ep = await readCSV('EP.csv', row => ({
            oracle_ccid: row['Oracle Ccid'],
            region: row['Region'],
            city: row['City'],
            mall: row['Mall'],
            division: row['Division'],
            brand: row['Brand'],
            store_name: row['Store Name'],
            store_type: row['Store Type'],
            opening_date: parseDate(row['Opening Date']),
            sqm: parseSqm(row['Size (sqm)']),
            fm_supervisor: row['FM Supervisor'],
            fm_manager: row['FM Manager'],
            store_status: row['Store Status']
        }));

        // 2. Load and Map CP.csv (Central Province)
        const cp = await readCSV('CP.csv', row => ({
            oracle_ccid: row['Oracle Ccid'],
            region: row['Region'],
            city: row['City'],
            mall: row['Mall'],
            division: row['Division'],
            brand: row['Brand'],
            store_name: row['Store Name'],
            store_type: row['Store Type'],
            opening_date: parseDate(row['Opening Date']),
            sqm: parseSqm(row['Size (sqm)']),
            fm_supervisor: row['FS - new'],
            fm_manager: null, // Not provided in CP file
            store_status: row['Store Status']
        }));

        // 3. Load and Map WP.csv (Western Province)
        const wp = await readCSV('WP.csv', row => ({
            oracle_ccid: row['Oracle Ccid'],
            region: row['Region'],
            city: row['City'],
            mall: row['Mall'],
            division: row['Division'],
            brand: row['Brand'],
            store_name: row['Store Name'],
            store_type: row['Store Type'],
            opening_date: parseDate(row['Opening Date']),
            sqm: parseSqm(row['SQM']),
            fm_supervisor: row['FS'],
            fm_manager: row['FM'],
            store_status: row['Store Status']
        }));

        // 4. Combine and filter out garbage rows (like #N/A or empty PKs)
        const allData = [...ep, ...cp, ...wp].filter(item =>
            item.oracle_ccid &&
            item.oracle_ccid !== '#N/A' &&
            item.oracle_ccid.trim() !== ''
        );

        console.log(`Successfully mapped ${allData.length} stores. Syncing with Database...`);

        // 5. Bulk Insert/Update
        // If the oracle_ccid exists, it updates the record. If not, it creates it.
        await Store.bulkCreate(allData, {
            updateOnDuplicate: [
                'region', 'city', 'mall', 'division', 'brand',
                'store_name', 'store_type', 'opening_date',
                'sqm', 'fm_supervisor', 'fm_manager', 'store_status'
            ]
        });

        console.log('✅ SUCCESS: Database has been fully updated.');
        process.exit(0);

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    }
}

run();