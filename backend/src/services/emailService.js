const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Nodemailer no pudo conectar:', error.message);
  } else {
    console.log('✅ Nodemailer listo para enviar emails');
  }
});

async function enviarConfirmacion(reserva) {
  const { Nombre, email, Servicio, fecha_reserva, hora_reserva, cancelToken } = reserva;
  const fechaFormateada = new Date(fecha_reserva).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const cancelUrl = `https://seijaku-balance-production.up.railway.app/api/reservas/cancelar/${cancelToken}`;

  const emailCliente = {
    from: `"Seijaku Balance 🌸" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Reserva confirmada - ${Servicio}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #faf9f7; padding: 40px; border-radius: 8px;">
        <h1 style="color: #2c4a3e; border-bottom: 1px solid #c9a96e; padding-bottom: 16px;">🌸 Seijaku Balance</h1>
        <h2 style="color: #4a7c6f;">Tu reserva está confirmada</h2>
        <p style="color: #555;">Hola <strong>${Nombre}</strong>, nos complace confirmar tu cita:</p>
        <div style="background: #fff; border-left: 4px solid #c9a96e; padding: 20px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 8px 0; color: #2c4a3e;"><strong>Servicio:</strong> ${Servicio}</p>
          <p style="margin: 8px 0; color: #2c4a3e;"><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p style="margin: 8px 0; color: #2c4a3e;"><strong>Hora:</strong> ${hora_reserva}</p>
        </div>
        <p style="color: #888; font-size: 14px;">⚠️ Si necesitas cancelar, hazlo con al menos <strong>48 horas de antelación</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${cancelUrl}" style="display: inline-block; padding: 14px 32px; background: #c0392b; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
            ❌ Cancelar mi reserva
          </a>
          <p style="color: #aaa; font-size: 12px; margin-top: 8px;">Este enlace expira 48h antes de tu cita.</p>
        </div>
        <p style="color: #aaa; font-size: 12px; text-align: center;">Seijaku Balance · Centro de Masajes y Aeroyoga</p>
      </div>
    `,
  };

  const emailPropietario = {
    from: `"Sistema Seijaku 🌸" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_OWNER,
    subject: `📋 Nueva reserva: ${Nombre} - ${Servicio}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f5f5f5; border-radius: 8px;">
        <h2 style="color: #2c4a3e;">Nueva reserva recibida</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Cliente:</td><td style="padding: 8px;">${Nombre}</td></tr>
          <tr style="background:#fff"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Servicio:</td><td style="padding: 8px;">${Servicio}</td></tr>
          <tr style="background:#fff"><td style="padding: 8px; font-weight: bold;">Fecha:</td><td style="padding: 8px;">${fechaFormateada}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Hora:</td><td style="padding: 8px;">${hora_reserva}</td></tr>
        </table>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(emailCliente),
      transporter.sendMail(emailPropietario),
    ]);
    console.log(`📧 Emails de confirmación enviados a ${email}`);
  } catch (error) {
    console.error('❌ Error al enviar emails de confirmación:', error.message);
  }
}

async function enviarCancelacion(reserva) {
  const { Nombre, email, Servicio, fecha_reserva, hora_reserva } = reserva;
  const fechaFormateada = new Date(fecha_reserva).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const emailCliente = {
    from: `"Seijaku Balance 🌸" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `❌ Reserva cancelada - ${Servicio}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #faf9f7; padding: 40px; border-radius: 8px;">
        <h1 style="color: #2c4a3e; border-bottom: 1px solid #c9a96e; padding-bottom: 16px;">🌸 Seijaku Balance</h1>
        <h2 style="color: #c0392b;">Tu reserva ha sido cancelada</h2>
        <p style="color: #555;">Hola <strong>${Nombre}</strong>, tu cita ha sido cancelada:</p>
        <div style="background: #fff; border-left: 4px solid #c0392b; padding: 20px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 8px 0; color: #2c4a3e;"><strong>Servicio:</strong> ${Servicio}</p>
          <p style="margin: 8px 0; color: #2c4a3e;"><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p style="margin: 8px 0; color: #2c4a3e;"><strong>Hora:</strong> ${hora_reserva}</p>
        </div>
        <p style="color: #555;">Si deseas hacer una nueva reserva visita nuestra web.</p>
        <p style="color: #aaa; font-size: 12px; text-align: center;">Seijaku Balance · Centro de Masajes y Aeroyoga</p>
      </div>
    `,
  };

  const emailPropietario = {
    from: `"Sistema Seijaku 🌸" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_OWNER,
    subject: `🚫 Reserva cancelada: ${Nombre} - ${Servicio}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f5f5f5; border-radius: 8px;">
        <h2 style="color: #c0392b;">Reserva cancelada</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Cliente:</td><td style="padding: 8px;">${Nombre}</td></tr>
          <tr style="background:#fff"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Servicio:</td><td style="padding: 8px;">${Servicio}</td></tr>
          <tr style="background:#fff"><td style="padding: 8px; font-weight: bold;">Fecha:</td><td style="padding: 8px;">${fechaFormateada}</td></tr>
        </table>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(emailCliente),
      transporter.sendMail(emailPropietario),
    ]);
    console.log(`📧 Emails de cancelación enviados a ${email}`);
  } catch (error) {
    console.error('❌ Error al enviar emails de cancelación:', error.message);
  }
}

module.exports = { enviarConfirmacion, enviarCancelacion };
