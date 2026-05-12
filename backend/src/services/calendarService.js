const { getCalendarClient } = require('../config/googleCalendar');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

async function crearEvento(reserva) {
  const calendar = getCalendarClient();
  console.log('📅 CALENDAR_ID:', CALENDAR_ID);
  console.log('📅 Calendar client:', calendar ? 'OK' : 'NULL');
  if (!calendar || !CALENDAR_ID) {
    console.warn('⚠️  Google Calendar no disponible. Saltando creación de evento.');
    return null;
  }

  try {
    // Limpiar formato de hora (quitar segundos si vienen como HH:MM:SS)
    const horaLimpia = reserva.hora_reserva.substring(0, 5);
    const startDateTime = `${reserva.fecha_reserva}T${horaLimpia}:00`;
    const endDateTime = calcularFinEvento(reserva.fecha_reserva, horaLimpia, 60);

    console.log('📅 Intentando crear evento:', startDateTime, '→', endDateTime);

    const event = {
      summary: `🌸 ${reserva.Servicio} - ${reserva.Nombre}`,
      description: `
        Cliente: ${reserva.Nombre}
        Email: ${reserva.email}
        Servicio: ${reserva.Servicio}
      `.trim(),
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Madrid',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Madrid',
      },
      colorId: '3',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    console.log(`📅 Evento Google Calendar creado: ${response.data.id}`);
    return response.data.id;

  } catch (error) {
    console.error('❌ Error al crear evento en Google Calendar:', error.message);
    console.error('❌ Detalles:', JSON.stringify(error.errors || {}, null, 2));
    return null;
  }
}

async function eliminarEvento(eventId) {
  if (!eventId) return false;

  const calendar = getCalendarClient();
  if (!calendar || !CALENDAR_ID) {
    console.warn('⚠️  Google Calendar no disponible. Saltando eliminación.');
    return false;
  }

  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });
    console.log(`🗑️  Evento Google Calendar eliminado: ${eventId}`);
    return true;
  } catch (error) {
    console.error('⚠️  Error al eliminar evento:', error.message);
    return false;
  }
}

function calcularFinEvento(fecha, hora, duracionMinutos) {
  const fechaInicio = new Date(`${fecha}T${hora}`);
  fechaInicio.setMinutes(fechaInicio.getMinutes() + duracionMinutos);
  const h = String(fechaInicio.getHours()).padStart(2, '0');
  const m = String(fechaInicio.getMinutes()).padStart(2, '0');
  return `${fecha}T${h}:${m}:00`;
}

module.exports = { crearEvento, eliminarEvento };