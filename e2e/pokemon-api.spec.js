const { test, expect } = require('@playwright/test');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Pokemon API Endpoints', () => {
  test('should return correct data structure from search endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/search?q=pikachu`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty('results');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('limit');
    expect(data).toHaveProperty('offset');

    expect(Array.isArray(data.results)).toBeTruthy();
    expect(data.total).toBeGreaterThan(0);

    // Check result structure
    if (data.results.length > 0) {
      expect(data.results[0]).toHaveProperty('name');
      expect(data.results[0].name).toBe('pikachu');
    }
  });

  test('should respect pagination parameters in search endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/search?q=char&limit=5&offset=0`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.limit).toBe(5);
    expect(data.offset).toBe(0);
    expect(data.results.length).toBeLessThanOrEqual(5);
  });

  test('should return Pokemon with name and types from detail endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/pikachu`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('types');
    expect(data).toHaveProperty('id');

    expect(data.name).toBe('pikachu');
    expect(Array.isArray(data.types)).toBeTruthy();
    expect(data.types.length).toBeGreaterThan(0);

    // Pikachu should be electric type
    expect(data.types).toContain('electric');
  });

  test('should return 404 for invalid Pokemon name', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/invalidpokemonname123`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should handle empty query parameter in search', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/search?q=`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
  });

  test('should handle missing query parameter in search', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/search`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
  });

  test('should perform case-insensitive search', async ({ request }) => {
    const lowerCaseResponse = await request.get(`${API_BASE_URL}/api/pokemon/search?q=pikachu`);
    const upperCaseResponse = await request.get(`${API_BASE_URL}/api/pokemon/search?q=PIKACHU`);
    const mixedCaseResponse = await request.get(`${API_BASE_URL}/api/pokemon/search?q=PiKaChU`);

    const lowerData = await lowerCaseResponse.json();
    const upperData = await upperCaseResponse.json();
    const mixedData = await mixedCaseResponse.json();

    // All should return same results
    expect(lowerData.total).toBe(upperData.total);
    expect(lowerData.total).toBe(mixedData.total);
    expect(lowerData.total).toBeGreaterThan(0);
  });

  test('should return multiple matching Pokemon for partial search', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/search?q=char`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should find charmander, charmeleon, charizard, etc.
    expect(data.total).toBeGreaterThan(1);

    // All results should contain 'char'
    data.results.forEach(pokemon => {
      expect(pokemon.name.toLowerCase()).toContain('char');
    });
  });

  test('should return all Pokemon data fields from detail endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pokemon/bulbasaur`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Check all expected fields
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('types');
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('height');
    expect(data).toHaveProperty('weight');

    // Bulbasaur should be grass/poison type
    expect(data.types).toEqual(expect.arrayContaining(['grass', 'poison']));
  });

  test('should handle pagination offset correctly', async ({ request }) => {
    // Get first page
    const firstPageResponse = await request.get(`${API_BASE_URL}/api/pokemon/search?q=a&limit=5&offset=0`);
    const firstPage = await firstPageResponse.json();

    // Get second page
    const secondPageResponse = await request.get(`${API_BASE_URL}/api/pokemon/search?q=a&limit=5&offset=5`);
    const secondPage = await secondPageResponse.json();

    // Pages should have different results
    expect(firstPage.results[0].name).not.toBe(secondPage.results[0].name);

    // Both should have correct offset
    expect(firstPage.offset).toBe(0);
    expect(secondPage.offset).toBe(5);
  });

  test('should handle health check endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });
});
