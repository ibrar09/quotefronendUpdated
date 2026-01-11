import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // ✅ note the .js extension

const JobItem = sequelize.define('JobItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Links this item to the main Job/Quotation
    job_id: {
        type: DataTypes.INTEGER,
        references: { model: 'jobs', key: 'id' },
        onDelete: 'CASCADE' // If Job is deleted, delete these items too
    },
    // AUTO-FILL LINK: The code from your PriceList (e.g., PL00069)
    // If you type a manual item not in the list, this will be NULL
    item_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // DESCRIPTION: Copied from PriceList OR typed manually by you
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: 'PCS'
    },
    // QUANTITY: How many pieces or meters
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 1
    },
    // MATERIAL PRICE: Captured at the time of the quote 
    // (Protects history if PriceList rates change later)
    material_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    // LABOR PRICE: Captured at the time of the quote
    labor_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    // UNIT TOTAL: (Material + Labor)
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // REMARKS: Specific notes for this item (e.g., "50% extra labor added")
    remarks: {
        type: DataTypes.TEXT
    },
    // AUTOMATIC TOTAL: Qty * Unit Price
    // This is a "Virtual" field, it doesn't stay in the DB, 
    // it calculates on the fly when you view the record.
    total_amount: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.quantity * this.unit_price;
        }
    }
}, {
    tableName: 'job_items',
    timestamps: true
});

export default JobItem;
