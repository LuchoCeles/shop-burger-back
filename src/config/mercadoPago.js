const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require("mercadopago");
require("dotenv").config();

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
})

const preference = new Preference(client);
const payment = new Payment(client);
const merchantOrder = new MerchantOrder(client);

module.exports = { preference, payment, merchantOrder }