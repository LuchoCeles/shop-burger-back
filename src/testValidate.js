const validateHour = require("./middlewares/validateHour");

(async () => {
  const resultado = await validateHour();
  console.log("Resultado:", resultado);
})();
