const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize({
    database: 'HarmonicArchiveData', // Your database name
    dialect: 'mssql',
    dialectModule: require('tedious'),
    host: 'localhost', // Note the double backslash
    dialectOptions: {
      options: {
        trustedConnection: true, // Equivalent to Trusted_Connection=True
        encrypt: false,
        trustServerCertificate: true, // For local development
        instanceName: '' // Specify the instance name
      }
    }
  });

// Test the connection
async function testConnection() {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }
  
  testConnection();

module.exports = sequelize;