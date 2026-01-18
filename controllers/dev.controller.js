
import User from '../models/user.js';
import sequelize from '../config/db.js';

export const seedAdmin = async (req, res) => {
    try {
        console.log('🔄 Starting Admin Seeding Process...');

        // Ensure connection
        await sequelize.authenticate();

        const adminEmail = 'admin@maaj.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('⚠️ Admin user exists. Resetting password...');
            existingAdmin.password = 'password123';
            await existingAdmin.save();
            return res.json({
                success: true,
                message: 'Admin password reset to: password123',
                email: adminEmail,
                status: 'UPDATED'
            });
        } else {
            console.log('ℹ️ Creating new Admin user...');
            await User.create({
                username: 'Admin',
                email: adminEmail,
                password: 'password123',
                role: 'ADMIN',
                permissions: ['ALL_ACCESS']
            });
            return res.json({
                success: true,
                message: 'Admin user created successfully',
                email: adminEmail,
                password: 'password123',
                status: 'CREATED'
            });
        }
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed admin user',
            error: error.message
        });
    }
};
