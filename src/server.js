require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// importaciones CRON JOB
const cron = require('node-cron');
const pedidoService = require('./services/pedidosService'); 
const { MetodosDePago,Pago } = require('./models'); // modelo para consulta
const { Op } = require('sequelize'); 


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

    // Middleware para sockets
    app.set('io', io);
    io.on('connection', (socket) => {
      console.log('🟢 Cliente conectado:', socket.id);
      socket.on('disconnect', () => console.log('🔴 Cliente desconectado:', socket.id));
    });

    // ========== CRON JOB ==========.
    // Se ejecutará cada 11 minutos para limpiar pedidos abandonados.
    cron.schedule('*/1 * * * *', async () => {
  console.log(`[CRON JOB] Ejecutando tarea de limpieza de pagos de MP pendientes... (${new Date().toLocaleString()})`);

  try {
    // método de pago "Mercado Pago" 
    const metodoMp = await MetodosDePago.findOne({ where: { nombre: 'Mercado Pago' } });
    if (!metodoMp) {
      console.error("[CRON JOB] No se encontró el método de pago 'Mercado Pago' en la base de datos. La tarea no puede continuar.");
      return;
    }
    const TIEMPO_EXPIRACION_MS = 10 * 60 * 1000; // 10 minutos
    const umbral = new Date(Date.now() - TIEMPO_EXPIRACION_MS);

    // Buscamos todos los PAGOS pendientes, de Mercado Pago, que son más antiguos que nuestro umbral.
    const pagosExpirados = await Pago.findAll({
      where: {
        estado: 'Pendiente',
        idMetodoDePago: metodoMp.id, //  Solo Mercado Pago
        createdAt: {
          [Op.lt]: umbral // Creados hace más de 10 min
        }
      }
    });

    if (pagosExpirados.length === 0) {
      console.log('[CRON JOB] No se encontraron pagos de MP expirados para cancelar.');
      return;
    }

    console.log(`[CRON JOB] Se encontraron ${pagosExpirados.length} pago(s) de MP expirado(s). Procediendo a cancelar los pedidos asociados...`);

    // Iteramos sobre cada pago expirado y cancelamos su pedido asociado.
    for (const pago of pagosExpirados) {
      const pedidoId = pago.idPedido;
      console.log(`[CRON JOB] Cancelando pedido ID: ${pedidoId} (asociado al pago ID: ${pago.id})...`);
      
      // Llamamos al mismo servicio de cancelación que ya es robusto.
      // Este servicio se encargará de cambiar el estado del pedido a 'cancelado',
      // y también podemos hacer que cambie el estado del pago.
      await pedidoService.cancel(pedidoId);
    }

  } catch (error) {
    console.error('[CRON JOB] Error durante la ejecución de la tarea de limpieza de pagos:', error.message);
  }
});
    // ===========================================

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