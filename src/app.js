const express = require('express');
const cors = require('cors');
const { authRoutes } = require('./modules/auth');
const errorHandler = require('./shared/middleware/errorHandler');
const notFound = require('./shared/middleware/notFound');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

app.get('/version', (req, res) => {
  res.json({ success: true, message: 'Code is running on version v1.0.2', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
