// models/pricelist.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PriceList = sequelize.define('PriceList', {
    code: { type: DataTypes.STRING, primaryKey: true },
    type: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    unit: { type: DataTypes.STRING },
    material_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    labor_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total_price: { type: DataTypes.DECIMAL(10, 2) },
    remarks: { type: DataTypes.TEXT },
    comments: { type: DataTypes.TEXT }
}, { tableName: 'price_lists' });

export default PriceList;  // ✅ ES Module export
