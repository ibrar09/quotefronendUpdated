import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js'; // Ensure you add .js
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';

// Initialize dotenv
dotenv.config();

const app = express();

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') console.log('Body keys:', Object.keys(req.body));
    next();
});

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000' // Legacy/fallback
];

app.use(cors({
    origin: function (origin, callback) {
        // If no origin (like server-to-server or curl), allow it
        if (!origin) return callback(null, true);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Allow all if '*' or if it matches the current origin
        if (frontendUrl === '*' || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
            return callback(null, true);
        }

        console.warn(`⚠️ CORS blocked for origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Main API Route
app.use('/api', apiRouter);
app.post('/api/test', (req, res) => {
    res.json({ message: "API is working!" });
});

// 1. Test Database Connection
sequelize.authenticate()
    .then(() => {
        console.log('✅ Connection to pgAdmin (PostgreSQL) has been established successfully.');
    })
    .catch(err => {
        console.error('❌ Unable to connect to the database:', err);
    });

// 2. Health Check Route
app.get('/', (req, res) => {
    res.send('Quotations System Server is Running & Connected to DB!');
});

// 3. Database Sync
sequelize.sync({ alter: true })
    .then(() => console.log('✅ Database Tables Synced'))
    .catch(err => console.log('❌ Sync Error: ' + err));

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`   QUOTATIONS SYSTEM STARTING...          `);
    console.log(`   SERVER RUNNING ON PORT: ${PORT}        `);
    console.log(`==========================================`);
});