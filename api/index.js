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
 * Get ability details including flavor text and effect description
 * @param {string} abilityUrl - URL to fetch ability details
 * @returns {Promise<Object>} - Ability details with flavorText and effect
 */
async function getAbilityDetails(abilityUrl) {
  try {
    const response = await axios.get(abilityUrl, {
      timeout: 10000
    });

    // Get English flavor text (short description)
    const flavorTextEntry = response.data.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\n/g, ' ') : '';

    // Get English effect (full description)
    const effectEntry = response.data.effect_entries.find(
      entry => entry.language.name === 'en'
    );
    const effect = effectEntry ? effectEntry.effect : '';

    return { flavorText, effect };
  } catch (error) {
    console.error(`Failed to fetch ability details: ${error.message}`);
    return { flavorText: '', effect: '' };
  }
}

/**
 * Get species data and evolution chain for a Pokemon
 * @param {number} pokemonId - Pokemon ID
 * @returns {Promise<Object>} - Evolution data with preEvolution and evolution
 */
async function getSpeciesData(pokemonId) {
  try {
    // Fetch species data
    const speciesResponse = await axios.get(`${POKEAPI_BASE_URL}/pokemon-species/${pokemonId}`, {
      timeout: 10000
    });

    // Fetch evolution chain
    const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
    const evolutionResponse = await axios.get(evolutionChainUrl, {
      timeout: 10000
    });

    // Parse evolution chain
    const chain = evolutionResponse.data.chain;
    let preEvolution = null;
    let evolution = null;

    // Find current Pokemon in the chain
    const findInChain = (chainNode, parent = null) => {
      if (chainNode.species.name === speciesResponse.data.name) {
        // Found current Pokemon
        if (parent) {
          preEvolution = parent.species.name;
        }
        if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
          evolution = chainNode.evolves_to[0].species.name;
        }
        return true;
      }

      // Search in evolutions
      for (const evolvedForm of chainNode.evolves_to) {
        if (findInChain(evolvedForm, chainNode)) {
          return true;
        }
      }
      return false;
    };

    findInChain(chain);

    return { preEvolution, evolution };
  } catch (error) {
    console.error(`Failed to fetch species/evolution data: ${error.message}`);
    return { preEvolution: null, evolution: null };
  }
}

/**
 * Get detailed Pokemon data by name
 * @param {string} name - Pokemon name
 * @returns {Promise<Object>} - Pokemon data including types, sprites, stats, abilities, and evolution
 */
async function getPokemonByName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid Pokemon name');
  }

  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name.toLowerCase()}`, {
      timeout: 10000
    });

    // Extract sprites
    const sprites = {
      default: response.data.sprites.front_default || null,
      shiny: response.data.sprites.front_shiny || null
    };

    // Extract stats
    const stats = response.data.stats.map(statInfo => ({
      name: statInfo.stat.name,
      value: statInfo.base_stat
    }));

    // Fetch ability details
    const abilitiesPromises = response.data.abilities.map(async abilityInfo => {
      const details = await getAbilityDetails(abilityInfo.ability.url);
      return {
        name: abilityInfo.ability.name,
        flavorText: details.flavorText,
        effect: details.effect
      };
    });

    const abilities = await Promise.all(abilitiesPromises);

    // Fetch evolution data
    const evolution = await getSpeciesData(response.data.id);

    return {
      name: response.data.name,
      types: response.data.types.map(typeInfo => typeInfo.type.name),
      id: response.data.id,
      height: response.data.height,
      weight: response.data.weight,
      sprites,
      stats,
      abilities,
      evolution
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
    console.log(`[Vercel API] Pokemon details fetched for: ${name}`, {
      hasSprites: !!pokemon.sprites,
      hasStats: !!pokemon.stats && pokemon.stats.length > 0,
      hasAbilities: !!pokemon.abilities && pokemon.abilities.length > 0,
      hasEvolution: !!pokemon.evolution
    });
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
