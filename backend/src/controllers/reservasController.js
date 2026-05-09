const pool = require('../config/db');
const { crearEvento, eliminarEvento } = require('../services/calendarService');
const { enviarConfirmacion, enviarCancelacion } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

async function obtenerReservas(req, res, next) {
  try {
    const { vista = 'futuras' } = req.query;
    let whereClause = '';

    if (vista === 'futuras') {
      whereClause = `WHERE estado = 'confirmada' AND fecha_reserva >= CURDATE()`;
    } else if (vista === 'pasadas') {
      whereClause = `WHERE (estado = 'completada' OR (estado = 'confirmada' AND fecha_reserva < CURDATE()))`;
    } else if (vista === 'canceladas') {
      whereClause = `WHERE estado = 'cancelada'`;
    } else {
      whereClause = `WHERE 1=1`;
    }

    const [rows] = await pool.query(
      `SELECT * FROM reservas ${whereClause}
       ORDER BY fecha_reserva DESC, hora_reserva DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function obtenerServicios(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function crearReserva(req, res, next) {
  const { Nombre, email, Servicio, fecha_reserva, hora_reserva } = req.body;

  if (!Nombre || !email || !Servicio || !fecha_reserva || !hora_reserva) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios.'
    });
  }

  const ahora = new Date();
  const fechaCita = new Date(`${fecha_reserva}T${hora_reserva}`);

  if (fechaCita <= ahora) {
    return res.status(400).json({
      success: false,
      message: 'No se pueden crear reservas en fechas pasadas.'
    });
  }

  try {
    // ── Anti-solapamiento ──────────────────────
    const [ocupadas] = await pool.query(
      `SELECT idReservas FROM reservas 
       WHERE fecha_reserva = ? AND hora_reserva = ? AND estado = 'confirmada'`,
      [fecha_reserva, hora_reserva]
    );

    if (ocupadas.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ese horario ya está ocupado. Por favor, elige otra hora.'
      });
    }

    // ── Límite de citas por día ─────────────────
    const [citasDia] = await pool.query(
      `SELECT COUNT(*) as total FROM reservas 
       WHERE fecha_reserva = ? AND estado = 'confirmada'`,
      [fecha_reserva]
    );

    if (citasDia[0].total >= 8) {
      return res.status(429).json({
        success: false,
        message: 'Lo sentimos, no hay más disponibilidad para ese día. Por favor elige otra fecha.'
      });
    }

    // ── Límite de reservas por email ───────────
    const [reservasEmail] = await pool.query(
      `SELECT COUNT(*) as total FROM reservas 
       WHERE email = ? AND estado = 'confirmada' AND fecha_reserva >= CURDATE()`,
      [email]
    );

    if (reservasEmail[0].total >= 2) {
      return res.status(429).json({
        success: false,
        message: 'Solo se pueden tener 2 reservas activas por email. Cancela una cita existente para poder reservar de nuevo.'
      });
    }

    // ── Generar token de cancelación ───────────
    const cancelToken = uuidv4();
    const tokenExpiry = new Date(fechaCita.getTime() - (48 * 60 * 60 * 1000));

    // ── Insertar reserva ───────────────────────
    const [result] = await pool.query(
      `INSERT INTO reservas (Nombre, email, Servicio, fecha_reserva, hora_reserva, cancel_token, token_expiry) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Nombre, email, Servicio, fecha_reserva, hora_reserva, cancelToken, tokenExpiry]
    );

    const nuevaReservaId = result.insertId;
    const reservaData = { Nombre, email, Servicio, fecha_reserva, hora_reserva };

    // ── Google Calendar ────────────────────────
    const googleEventId = await crearEvento(reservaData);
    if (googleEventId) {
      await pool.query(
        'UPDATE reservas SET google_event_id = ? WHERE idReservas = ?',
        [googleEventId, nuevaReservaId]
      );
    }

    // ── Emails ─────────────────────────────────
    await enviarConfirmacion({ ...reservaData, idReservas: nuevaReservaId, cancelToken });

    res.status(201).json({
      success: true,
      message: 'Reserva creada correctamente.',
      data: { idReservas: nuevaReservaId, googleEventId }
    });

  } catch (error) {
    next(error);
  }
}

async function cancelarReserva(req, res, next) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM reservas WHERE idReservas = ? AND estado = "confirmada"',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o ya cancelada.'
      });
    }

    const reserva = rows[0];
    const ahora = new Date();
    const fechaStr = reserva.fecha_reserva.toISOString().split('T')[0];
    const fechaCita = new Date(`${fechaStr}T${reserva.hora_reserva}`);
    const horasRestantes = (fechaCita - ahora) / (1000 * 60 * 60);

    if (horasRestantes < 48) {
      return res.status(403).json({
        success: false,
        message: `No se puede cancelar con menos de 48 horas de antelación.`
      });
    }

    await pool.query(
      'UPDATE reservas SET estado = "cancelada" WHERE idReservas = ?',
      [id]
    );

    if (reserva.google_event_id) {
      await eliminarEvento(reserva.google_event_id);
    }

    await enviarCancelacion(reserva);

    res.json({ success: true, message: 'Reserva cancelada correctamente.' });

  } catch (error) {
    next(error);
  }
}

async function cancelarPorToken(req, res, next) {
  const { token } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM reservas WHERE cancel_token = ? AND estado = 'confirmada'`,
      [token]
    );

    if (rows.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/cancelacion?estado=no_encontrada`);
    }

    const reserva = rows[0];
    const ahora = new Date();

    if (ahora >= new Date(reserva.token_expiry)) {
      return res.redirect(`${process.env.FRONTEND_URL}/cancelacion?estado=expirado`);
    }

    await pool.query(
      'UPDATE reservas SET estado = "cancelada" WHERE idReservas = ?',
      [reserva.idReservas]
    );

    if (reserva.google_event_id) {
      await eliminarEvento(reserva.google_event_id);
    }

    await enviarCancelacion(reserva);

    res.redirect(
      `${process.env.FRONTEND_URL}/cancelacion?estado=ok&nombre=${encodeURIComponent(reserva.Nombre)}`
    );

  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerReservas,
  crearReserva,
  cancelarReserva,
  obtenerServicios,
  cancelarPorToken
};