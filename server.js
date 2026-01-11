import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import apiRouter from './routes/index.js';

dotenv.config();

const app = express();

// 1. BULLETPROOF CORS (MUST BE FIRST)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. PARSERS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. SAFE LOGGING
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 4. HEALTH CHECKS
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'API is running' });
});

app.get('/', (req, res) => {
    res.send('Quotation System API is Online');
});

// 5. ROUTES
app.use('/api', apiRouter);

// 6. GLOBAL ERROR HANDLER (PREVENTS 500 CRASHES)
app.use((err, req, res, next) => {
    console.error('💥 SERVER ERROR:', err);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 8080;

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database Connected');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('✅ Tables Synced');
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Database Initialization Failed:', err.message);
        // Start server anyway to provide error feedback
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT} (DB ERROR MODE)`);
        });
    });

export default app;