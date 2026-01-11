// scripts/seedStores.js
import db from '../models/index.js';
import Store from '../models/store.js';

async function seedStores() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    const store = await Store.create({
      oracle_ccid: 'CCID-001',
      region: 'Central',
      city: 'Riyadh',
      mall: 'Granada Center',
      division: 'Apparel',
      brand: 'Starbucks',
      store_name: 'Starbucks Riyadh',
      store_type: 'Mall',
      opening_date: '2025-01-01',
      sqm: 120.50,
      fm_supervisor: 'Abu Shahid',
      fm_manager: 'Samir',
      store_status: 'LFL'
    });

    console.log('✅ Store inserted:', store.oracle_ccid);
  } catch (err) {
    console.error('❌ Error seeding store:', err);
  } finally {
    await db.sequelize.close();
    console.log('✅ Database connection closed');
  }
}

seedStores(); // 🔹 Make sure this line exists
