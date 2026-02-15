const express = require('express');
const router = express.Router();
const { searchPokemonByPartialName, getPokemonByName } = require('../services/pokeapi');

/**
 * GET /api/pokemon/search
 * Search for Pokemon by partial name with pagination
 * Query params:
 *   - q: search query (required)
 *   - limit: results per page (default: 20)
 *   - offset: number of results to skip (default: 0)
 */
router.get('/search', async (req, res) => {
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

/**
 * GET /api/pokemon/:name
 * Get detailed information about a specific Pokemon
 */
router.get('/:name', async (req, res) => {
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

module.exports = router;
