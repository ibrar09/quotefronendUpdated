import sequelize from '../config/db.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const forceCreateAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection OK');

        // Sync to ensure table exists
        await sequelize.sync();

        const adminEmail = 'admin@maaj.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('⚠️ Admin already exists. Updating password...');
            existingAdmin.password = 'password123'; // Hook will hash it
            await existingAdmin.save();
            console.log('✅ Admin password Reset to: password123');
        } else {
            console.log('ℹ️ Creating Admin user...');
            await User.create({
                username: 'Admin',
                email: adminEmail,
                password: 'password123', // Hook will hash it
                role: 'ADMIN',
                permissions: ['ALL_ACCESS']
            });
            console.log('✅ Admin User Created Successfully: admin@maaj.com / password123');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

forceCreateAdmin();
