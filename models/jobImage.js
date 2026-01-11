import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const JobImage = sequelize.define('JobImage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    job_id: {
        type: DataTypes.INTEGER,
        references: { model: 'jobs', key: 'id' }
    },
    image_data: { type: DataTypes.TEXT }, // Storing Base64 for now
}, {
    tableName: 'job_images',
    timestamps: true
});

export default JobImage;
