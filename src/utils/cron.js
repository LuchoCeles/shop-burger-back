const cron = require('node-cron');
const pedidosService = require('../services/pedidosService');
const metodosDePagoService = require('../services/metodosDePagoService');
const pagosService = require('../services/pagosService');
const { getSocketInstance } = require('../config/socket');
require('dotenv').config();

const initializeCronJobs = () => {
  const io = getSocketInstance();
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log(`[CRON JOB] Limpieza de pagos pendientes... (${new Date().toLocaleString()})`);

      const metodoMp = await metodosDePagoService.getIdMP();
      if (!metodoMp) {
        console.error("[CRON JOB] No se encontró método 'Mercado Pago'.");
        return;
      }

      const umbral = new Date(Date.now() - process.env.MP_EXPIRY_MINUTES * 60000);
      const pagosExpirados = await pagosService.getPagosExpirados(metodoMp, umbral);

      if (!pagosExpirados.length) {
        console.log('[CRON JOB] No hay pagos expirados.');
        return;
      }

      await Promise.all(
        pagosExpirados.map(async (pago) => {
          const pedidoId = pago.idPedido;
          const pedido = await pedidosService.getById(pedidoId);
          if (!pedido || pedido.estado !== "Pendiente") return;

          console.log(`[CRON JOB] Cancelando pedido ID ${pedidoId} por pago expirado...`);

          await pagosService.updateMp(pago.id, "Expirado");
          await pedidosService.cancel(pedidoId);
          io.emit("pagoExpirado", {
            pedidoId,
            message: "Pago expirado automáticamente"
          });
        })
      );

    } catch (err) {
      console.error('[CRON JOB] Error en limpieza:', err);
    }
  });
};

module.exports = initializeCronJobs;