require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pokemon Database API is running' });
});

// API routes
const pokemonRoutes = require('./routes/pokemon');
app.use('/api/pokemon', pokemonRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
