require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database (usar con cuidado en producción)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Base de datos sincronizada');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();