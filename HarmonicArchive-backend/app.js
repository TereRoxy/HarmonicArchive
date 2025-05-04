const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://192.168.100.2:5173', "http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Disposition']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/pdfs', express.static(path.join(__dirname, 'public', 'pdfs'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
const musicSheetRoutes = require('./routes/musicSheetRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const generationRoutes = require('./routes/generationRoutes');

app.use('/api/sheets', musicSheetRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/generate', generationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;