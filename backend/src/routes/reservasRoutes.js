const express = require('express');
const router = express.Router();
const {
  obtenerReservas,
  crearReserva,
  cancelarReserva,
  obtenerServicios,
  cancelarPorToken
} = require('../controllers/reservasController');

router.get('/', obtenerReservas);
router.get('/servicios', obtenerServicios);
router.get('/cancelar/:token', cancelarPorToken);
router.post('/', crearReserva);
router.delete('/:id', cancelarReserva);

module.exports = router;