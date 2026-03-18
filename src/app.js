const express = require('express');
const cors = require('cors');
const {
  authRoutes,
  clientRoutes,
  companyRoutes,
  estateRoutes,
  portfolioRoutes,
} = require('./modules');
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
  res.json({ success: true, message: 'Code is running on version v2.0.0', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/estates', estateRoutes);
app.use('/api/portfolios', portfolioRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
