import React, { useState } from 'react';
import Pagination from '../Pagination/Pagination';
import './SearchPanel.css';

function SearchPanel({
  onSearch,
  onSelectPokemon,
  results,
  loading,
  error,
  selectedPokemon,
  currentPage,
  totalPages,
  onPageChange,
  hasSearched
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search Pokemon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="submit"
          className="search-btn"
          disabled={loading || !searchQuery.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="results-container">
        {loading && <div className="loading-spinner">Loading...</div>}

        {!loading && !hasSearched && (
          <div className="placeholder-message">
            Start searching to see results
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="no-results-message">
            No results found
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <ul className="results-list">
              {results.map((pokemon) => (
                <li
                  key={pokemon.name}
                  className={`result-item ${selectedPokemon === pokemon.name ? 'selected' : ''}`}
                  onClick={() => onSelectPokemon(pokemon.name)}
                >
                  {pokemon.name}
                </li>
              ))}
            </ul>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPanel;
