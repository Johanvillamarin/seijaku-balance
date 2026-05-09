const Groq = require('groq-sdk');
const pool = require('../config/db');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Obtiene el contexto actual de la base de datos
 */
async function obtenerContextoDB() {
try {
    const [reservas] = await pool.query(`
    SELECT fecha_reserva, hora_reserva, Servicio
    FROM reservas
    WHERE estado = 'confirmada'
    AND fecha_reserva >= CURDATE()
    AND fecha_reserva <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY fecha_reserva ASC, hora_reserva ASC
    `);

    const [servicios] = await pool.query(`
    SELECT nombre, descripcion, duracion_minutos, precio, max_personas
    FROM servicios WHERE activo = 1
    `);

    const [horarios] = await pool.query(`
    SELECT dia_semana, hora_inicio, hora_fin
    FROM horarios_disponibles WHERE activo = 1
    `);

    const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

    return {
    reservasOcupadas: reservas.map(r => ({
        fecha: r.fecha_reserva.toISOString().split('T')[0],
        hora: r.hora_reserva,
        servicio: r.Servicio
    })),
    servicios,
    horarios: horarios.map(h => ({
        dia: diasSemana[h.dia_semana],
        apertura: h.hora_inicio,
        cierre: h.hora_fin
    }))
    };
} catch (error) {
    console.error('Error obteniendo contexto DB:', error.message);
    return { reservasOcupadas: [], servicios: [], horarios: [] };
}
}

/**
 * Procesa un mensaje y devuelve respuesta del chatbot
 */
async function procesarMensaje(mensaje, historial = []) {
  const contexto = await obtenerContextoDB();
  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const systemPrompt = `
Eres Kai, el asistente virtual de Seijaku Balance, un centro de masajes y aeroyoga.
Tu personalidad es tranquila, amable y profesional, acorde con la filosofía zen del centro.

FECHA ACTUAL: ${fechaHoy}

SERVICIOS DISPONIBLES:
${contexto.servicios.map(s =>
  `- ${s.nombre}: ${s.descripcion}. Duración: ${s.duracion_minutos}min. Precio: ${s.precio}€`
).join('\n')}

HORARIOS DEL CENTRO:
${contexto.horarios.map(h =>
  `- ${h.dia}: ${h.apertura} - ${h.cierre}`
).join('\n')}

RESERVAS OCUPADAS PRÓXIMOS 7 DÍAS:
${contexto.reservasOcupadas.length > 0
  ? contexto.reservasOcupadas.map(r => `- ${r.fecha} a las ${r.hora} (${r.servicio})`).join('\n')
  : 'No hay reservas ocupadas en los próximos 7 días, todos los horarios están libres'}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé conciso, máximo 3-4 frases por respuesta
- Si preguntan disponibilidad, consulta las reservas ocupadas y responde con datos reales
- Para hacer una reserva diles que usen el formulario de la página principal
- No inventes información que no esté en los datos de arriba
- Usa un tono cálido y zen 🌸
`.trim();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historial,
    { role: 'user', content: mensaje }
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 500,
    messages,
  });

  return response.choices[0].message.content;
}

module.exports = { procesarMensaje };
