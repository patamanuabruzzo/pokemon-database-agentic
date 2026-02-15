import React from 'react';
import './PokemonDetail.css';

function PokemonDetail({ pokemon, loading, error }) {
  if (loading) {
    return (
      <div className="pokemon-detail">
        <div className="loading-spinner">Loading Pokemon details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-detail">
        <div className="error-message" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="pokemon-detail">
        <div className="placeholder-message">
          Select a Pokemon to view details
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-detail">
      <h1 className="pokemon-name">{pokemon.name}</h1>

      <div className="pokemon-info-section">
        <h2 className="section-title">Types</h2>
        <div className="pokemon-types">
          {pokemon.types && pokemon.types.map((type) => (
            <span key={type} className={`type-badge type-${type}`}>
              {type}
            </span>
          ))}
        </div>
      </div>

      {pokemon.id && (
        <div className="pokemon-info-section">
          <h2 className="section-title">Basic Info</h2>
          <div className="basic-info">
            <div className="info-item">
              <span className="info-label">Pokedex #</span>
              <span className="info-value">#{pokemon.id}</span>
            </div>
            {pokemon.height && (
              <div className="info-item">
                <span className="info-label">Height</span>
                <span className="info-value">{pokemon.height / 10} m</span>
              </div>
            )}
            {pokemon.weight && (
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value">{pokemon.weight / 10} kg</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonDetail;
