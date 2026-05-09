const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';

function getCalendarClient() {
try {
    const credentialsPath = path.resolve(CREDENTIALS_PATH);

    if (!fs.existsSync(credentialsPath)) {
    console.warn('⚠️  credentials.json no encontrado. Google Calendar desactivado.');
    return null;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
    });

    return google.calendar({ version: 'v3', auth });
} catch (error) {
    console.error(' Error al cargar credenciales de Google:', error.message);
    return null;
}
}

module.exports = { getCalendarClient };
