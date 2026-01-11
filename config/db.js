// config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Standard Railway/Heroku/Production Connection String Support
const dbUrl = process.env.DB_URL || process.env.DATABASE_URL;

let sequelize;

if (dbUrl) {
  const url = new URL(dbUrl);
  console.log(`📡 [DB] Connecting to host: ${url.hostname}`);

  const isInternal = url.hostname.includes('.internal');

  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: isInternal ? false : {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  console.log('📡 [DB] Connecting via Individual Credentials...');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
    }
  );
}

// Export as default for ES6 import
export default sequelize;
