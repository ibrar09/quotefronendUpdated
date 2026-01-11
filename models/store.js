import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // ✅ note the .js extension

const Store = sequelize.define('Store', {
    // Primary link from your Main Sheet
    oracle_ccid: { 
        type: DataTypes.STRING, 
        primaryKey: true,
        allowNull: false 
    },
    region: { type: DataTypes.STRING },        // Central, Western, Eastern
    city: { type: DataTypes.STRING },          // Riyadh, Jeddah, etc.
    mall: { type: DataTypes.STRING },          // e.g., Granada Center
    division: { type: DataTypes.STRING },      // Apparel, Wellness, etc.
    brand: { type: DataTypes.STRING },         // Starbucks, H&M, etc.
    store_name: { type: DataTypes.STRING },
    store_type: { type: DataTypes.STRING },    // Mall Location, Plaza, etc.
    opening_date: { type: DataTypes.DATEONLY },
    sqm: { type: DataTypes.DECIMAL(10, 2) },   // Size of the store
    
    // The Personnel (Supervisors and Managers)
    fm_supervisor: { type: DataTypes.STRING }, // e.g., Abu Shahid, Abdul Rahman
    fm_manager: { type: DataTypes.STRING },    // e.g., Samir, Naif, Muath
    
    // Status
    store_status: { type: DataTypes.STRING }   // LFL, Closed, etc.
}, {
    tableName: 'master_stores', // Name in pgAdmin
    timestamps: true
});

export default Store;
