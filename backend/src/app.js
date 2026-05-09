require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reservasRoutes = require('./routes/reservasRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/reservas', reservasRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/api/health', (req, res) => {
res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
