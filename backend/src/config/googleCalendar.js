const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function getCalendarClient() {
  try {
    let credentials;

    // Producción: leer desde variable de entorno
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      console.log('✅ Google Calendar: credenciales cargadas desde variable de entorno');
    } else {
      // Desarrollo local: leer desde archivo
      const credentialsPath = path.resolve(
        process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json'
      );
      if (!fs.existsSync(credentialsPath)) {
        console.warn('⚠️  credentials.json no encontrado. Google Calendar desactivado.');
        return null;
      }
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      console.log('✅ Google Calendar: credenciales cargadas desde archivo local');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    return google.calendar({ version: 'v3', auth });

  } catch (error) {
    console.error('❌ Error al cargar credenciales de Google:', error.message);
    return null;
  }
}

module.exports = { getCalendarClient };
