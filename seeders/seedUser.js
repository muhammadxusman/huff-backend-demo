-*const bcrypt = require('bcryptjs');
const {User} = require('../models/index');

const seedUser = async () => {
  try {
    const existing = await User.findOne({ where: { email: 'admin@example.com' } });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      });

      console.log('✅ Default admin user created!');
    } else {
      console.log('ℹ️ Default admin user already exists.');
    }

    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedUser();
