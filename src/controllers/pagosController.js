const pagosService = require('../services/pagosService');

class PagosController {
	async update(req, res) {
		const { id, estado } = req.body;
		try {
			await pagosService.updateMp(id, estado);
			res.status(200).json({
				success: true,
				message: "Estado del pago actualizado correctamente."
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message
			});
		}
	}
}

module.exports = new PagosController();