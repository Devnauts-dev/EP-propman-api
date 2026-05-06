const express = require('express');
const cors = require('cors');
const { authRoutes } = require('./modules/auth');
const { clientsRoutes } = require('./modules/clients');
const { companiesRoutes } = require('./modules/companies');
const { estatesRoutes } = require('./modules/estates');
const { portfoliosRoutes } = require('./modules/portfolios');
const { propertiesRoutes } = require('./modules/properties');
const { unitsRoutes } = require('./modules/units');
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
app.use('/api/clients', clientsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/estates', estatesRoutes);
app.use('/api/portfolios', portfoliosRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/units', unitsRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
