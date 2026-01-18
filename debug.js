import sequelize from './config/db.js';
import User from './models/user.js';

const checkUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection OK');

        const users = await User.findAll();
        console.log('--- USERS IN DB ---');
        if (users.length === 0) {
            console.log('NO USERS FOUND!');
        } else {
            users.forEach(u => {
                console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Active: ${u.is_active}`);
                // console.log(`Password Hash: ${u.password}`); // Checking if it looks like a hash
            });
        }
        console.log('-------------------');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
