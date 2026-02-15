import React, { useState, useEffect } from 'react'
import './App.css'
import SearchPanel from './components/SearchPanel/SearchPanel'
import PokemonDetail from './components/PokemonDetail/PokemonDetail'
import { searchPokemon, getPokemonDetails } from './utils/api'

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPokemonName, setSelectedPokemonName] = useState(null);
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  // Handle search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setHasSearched(false);
      setError(null);
      setSelectedPokemonName(null);
      setPokemonDetail(null);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setHasSearched(true);

    try {
      const offset = 0;
      const data = await searchPokemon(query, itemsPerPage, offset);
      setSearchResults(data.results);
      setTotalResults(data.total);

      // Auto-select if only one result
      if (data.results.length === 1) {
        handleSelectPokemon(data.results[0].name);
      } else {
        setSelectedPokemonName(null);
        setPokemonDetail(null);
      }
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (newPage) => {
    setLoading(true);
    setError(null);

    try {
      const offset = (newPage - 1) * itemsPerPage;
      const query = document.querySelector('.search-input').value;
      const data = await searchPokemon(query, itemsPerPage, offset);
      setSearchResults(data.results);
      setCurrentPage(newPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Pokemon selection
  const handleSelectPokemon = async (name) => {
    setSelectedPokemonName(name);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const details = await getPokemonDetails(name);
      setPokemonDetail(details);
    } catch (err) {
      setDetailError(err.message);
      setPokemonDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon Database</h1>
        <p>Search and discover Pokémon information</p>
      </header>
      <main className="main-content">
        <div className="panels-container">
          <div className="left-panel">
            <SearchPanel
              onSearch={handleSearch}
              onSelectPokemon={handleSelectPokemon}
              results={searchResults}
              loading={loading}
              error={error}
              selectedPokemon={selectedPokemonName}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasSearched={hasSearched}
            />
          </div>
          <div className="right-panel">
            <PokemonDetail
              pokemon={pokemonDetail}
              loading={detailLoading}
              error={detailError}
              onSelectPokemon={handleSelectPokemon}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
