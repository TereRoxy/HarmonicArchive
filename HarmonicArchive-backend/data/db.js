const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize('HarmonicArchiveData', '', '',{
  host: 'localhost', // Replace with your SQL Server host
  dialect: 'mssql',  // Specify the dialect
  dialectOptions: {
    options: {
      encrypt: true, // Use encryption if required
      trustServerCertificate: true, // For self-signed certificates
    },
    trustedConnection: true, // Use trusted connection
  },
  logging: false, // Disable logging (optional)
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to SQL Server has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;