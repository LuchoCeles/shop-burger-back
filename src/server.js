require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const initializeCronJobs = require('./utils/cron');
const { setSocketInstance } = require("./config/socket");

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Create HTTP server y soket.io
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    setSocketInstance();

    io.on('connection', (socket) => {
      console.log('🟢 Cliente conectado:', socket.id);
      socket.on('disconnect', (reason) => {
        console.log('🔴 Cliente desconectado:', socket.id, reason);
      });
      // debug: escucha evento ping para verificar conexión desde front
      socket.on('ping-server', (payload) => {
        console.log('ping-server payload:', payload);
        socket.emit('pong-server', { ok: true, now: Date.now() });
      });
    });

    // Iniciar trabajos cron
    if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      initializeCronJobs(io);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();