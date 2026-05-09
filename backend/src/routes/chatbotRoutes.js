const express = require('express');
const router = express.Router();
const { procesarMensaje } = require('../services/chatbotService');

router.post('/mensaje', async (req, res, next) => {
const { mensaje, historial = [] } = req.body;

if (!mensaje || mensaje.trim() === '') {
    return res.status(400).json({
    success: false,
    message: 'El mensaje no puede estar vacío.'
    });
}

try {
    const respuesta = await procesarMensaje(mensaje, historial);
    res.json({ success: true, respuesta });
} catch (error) {
    next(error);
}
});

module.exports = router;
