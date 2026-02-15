const axios = require('axios');

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIST_CACHE_TTL = 1000 * 60 * 60; // 1 hour

// In-memory cache for Pokemon list
let pokemonListCache = null;
let cacheTimestamp = null;

/**
 * Fetch all Pokemon names from PokeAPI
 * Uses caching to avoid repeated API calls
 */
async function getAllPokemonNames() {
  const now = Date.now();

  // Return cached data if still valid
  if (pokemonListCache && cacheTimestamp && (now - cacheTimestamp) < POKEMON_LIST_CACHE_TTL) {
    return pokemonListCache;
  }

  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon?limit=10000`, {
      timeout: 10000 // 10 second timeout
    });

    pokemonListCache = response.data.results.map(pokemon => ({
      name: pokemon.name,
      url: pokemon.url
    }));
    cacheTimestamp = now;

    return pokemonListCache;
  } catch (error) {
    // If cache exists but is expired, return it anyway on error
    if (pokemonListCache) {
      console.error('PokeAPI fetch failed, returning stale cache:', error.message);
      return pokemonListCache;
    }
    throw new Error(`Failed to fetch Pokemon list: ${error.message}`);
  }
}

/**
 * Search Pokemon by partial name (case-insensitive)
 * @param {string} query - Search query (full or partial name)
 * @returns {Promise<Array>} - Array of matching Pokemon names
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
 * @param {string} name - Pokemon name
 * @returns {Promise<Object>} - Pokemon data including types
 */
async function getPokemonByName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid Pokemon name');
  }

  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name.toLowerCase()}`, {
      timeout: 10000 // 10 second timeout
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

module.exports = {
  getAllPokemonNames,
  searchPokemonByPartialName,
  getPokemonByName
};
