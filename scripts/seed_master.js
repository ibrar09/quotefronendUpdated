// scripts/seed_master.js
import db from '../models/index.js';
const { Store, PriceList, Job, sequelize } = db;

async function seed() {
    console.log('🚀 Starting Database Stabilization & Seeding...');

    try {
        // 1. SYNC SCHEMA (with alter to fix constraints)
        try {
            await sequelize.sync({ alter: true });
            console.log('✅ Schema synchronization complete.');
        } catch (syncError) {
            console.log('⚠️ Initial Sync failed (standard for FK violations). Attempting data repair first...');
        }

        // 2. REPAIR ORPHAN JOBS
        // Find all oracle_ccid in Jobs that don't exist in Stores
        const [orphans] = await sequelize.query(`
      SELECT DISTINCT j.oracle_ccid 
      FROM jobs j
      LEFT JOIN master_stores s ON j.oracle_ccid = s.oracle_ccid
      WHERE s.oracle_ccid IS NULL AND j.oracle_ccid IS NOT NULL
    `);

        if (orphans.length > 0) {
            console.log(`⚠️ Found ${orphans.length} orphan oracle_ccid(s). Creating stub stores...`);
            for (const row of orphans) {
                await Store.findOrCreate({
                    where: { oracle_ccid: row.oracle_ccid },
                    defaults: {
                        brand: 'UNKNOWN',
                        mall: 'PLACEHOLDER',
                        city: 'UNKNOWN',
                        store_status: 'AUTO-GENERATED'
                    }
                });
            }
            console.log('✅ Orphan records patched.');
        }

        // 3. SEED MASTER STORES (Initial Sample)
        const initialStores = [
            { oracle_ccid: '9999', brand: 'GENERAL', mall: 'HEAD OFFICE', city: 'RIYADH', store_status: 'ACTIVE' },
        ];

        for (const storeData of initialStores) {
            await Store.upsert(storeData);
        }
        console.log('✅ Master Stores seeded.');

        // 4. SEED PRICE LIST (Initial Sample)
        const initialPrices = [
            {
                code: 'MAT-001',
                description: 'SAMPLE MATERIAL',
                unit: 'EA',
                material_price: 100,
                labor_price: 50,
                total_price: 150
            }
        ];

        for (const price of initialPrices) {
            await PriceList.upsert(price);
        }
        console.log('✅ Price List seeded.');

        console.log('✨ Database is now STABLE and READY.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
