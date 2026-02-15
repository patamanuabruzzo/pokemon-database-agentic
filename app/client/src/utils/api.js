const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Search for Pokemon by name (full or partial)
 * @param {string} query - Search query
 * @param {number} limit - Results per page (default: 20)
 * @param {number} offset - Results to skip (default: 0)
 * @returns {Promise<Object>} - Search results with pagination info
 */
export async function searchPokemon(query, limit = 20, offset = 0) {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/pokemon/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API search error:', error);
    throw new Error(`Failed to search Pokemon: ${error.message}`);
  }
}

/**
 * Get detailed information about a specific Pokemon
 * @param {string} name - Pokemon name
 * @returns {Promise<Object>} - Pokemon details including types
 */
export async function getPokemonDetails(name) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pokemon/${name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      throw new Error('Pokemon not found');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API detail error:', error);
    throw error;
  }
}
