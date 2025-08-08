const { sequelize } = require('./config/db');
const {User} = require('./models/index');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true}); // use `force: true` if you want to drop tables and recreate
    console.log('Database synced successfully!');
    process.exit();
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

syncDatabase();

