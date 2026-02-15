const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PokeAPI Configuration
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIST_CACHE_TTL = 1000 * 60 * 60; // 1 hour

// In-memory cache for Pokemon list
let pokemonListCache = null;
let cacheTimestamp = null;

/**
 * Fetch all Pokemon names from PokeAPI with caching
 */
async function getAllPokemonNames() {
  const now = Date.now();

  // Return cached data if still valid
  if (pokemonListCache && cacheTimestamp && (now - cacheTimestamp) < POKEMON_LIST_CACHE_TTL) {
    return pokemonListCache;
  }

  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon?limit=10000`, {
      timeout: 10000
    });

    pokemonListCache = response.data.results.map(pokemon => ({
      name: pokemon.name,
      url: pokemon.url
    }));
    cacheTimestamp = now;

    return pokemonListCache;
  } catch (error) {
    // Return stale cache on error if available
    if (pokemonListCache) {
      console.error('PokeAPI fetch failed, returning stale cache:', error.message);
      return pokemonListCache;
    }
    throw new Error(`Failed to fetch Pokemon list: ${error.message}`);
  }
}

/**
 * Search Pokemon by partial name
 */
async function searchPokemonByPartialName(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const allPokemon = await getAllPokemonNames();
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery === '') {
    return [];
  }

  return allPokemon.filter(pokemon =>
    pokemon.name.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Get detailed Pokemon data by name
 */
async function getPokemonByName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid Pokemon name');
  }

  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name.toLowerCase()}`, {
      timeout: 10000
    });

    return {
      name: response.data.name,
      types: response.data.types.map(typeInfo => typeInfo.type.name),
      id: response.data.id,
      height: response.data.height,
      weight: response.data.weight
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Pokemon '${name}' not found`);
    }
    throw new Error(`Failed to fetch Pokemon details: ${error.message}`);
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Pokemon Database API',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      search: '/api/pokemon/search?q=char',
      details: '/api/pokemon/charmander'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pokemon Database API is running' });
});

// Pokemon search endpoint
app.get('/api/pokemon/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!query || query.trim() === '') {
      return res.json({
        results: [],
        total: 0,
        limit,
        offset
      });
    }

    // Search for matching Pokemon
    const allResults = await searchPokemonByPartialName(query);
    const total = allResults.length;

    // Apply pagination
    const paginatedResults = allResults.slice(offset, offset + limit);

    res.json({
      results: paginatedResults,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search Pokemon',
      message: error.message
    });
  }
});

// Pokemon details endpoint
app.get('/api/pokemon/:name', async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Pokemon name is required'
      });
    }

    const pokemon = await getPokemonByName(name);
    res.json(pokemon);
  } catch (error) {
    console.error('Pokemon detail error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Pokemon not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch Pokemon details',
      message: error.message
    });
  }
});

// Catch all for unknown routes
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/pokemon/search?q=<query>',
      'GET /api/pokemon/:name'
    ]
  });
});

// Export for Vercel serverless
module.exports = app;
