const { google } = require('googleapis');

// Utiliza as credenciais do seu terminal (Application Default Credentials)
const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = sheets;