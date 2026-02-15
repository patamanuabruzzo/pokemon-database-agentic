const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Pokemon Database API',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      pokemon: '/api/pokemon'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pokemon Database API is running' });
});

// Catch all for API routes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Export for Vercel serverless
module.exports = app;
