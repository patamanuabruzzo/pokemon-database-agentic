import React, { useState, useEffect } from 'react';
import './PokemonDetail.css';

function PokemonDetail({ pokemon, loading, error, onSelectPokemon }) {
  const [showShiny, setShowShiny] = useState(false);

  // Reset shiny state when Pokemon changes
  useEffect(() => {
    setShowShiny(false);
  }, [pokemon?.name]);

  const handleImageClick = () => {
    setShowShiny(!showShiny);
  };

  // Helper function to get stat value by name
  const getStatValue = (statName) => {
    const stat = pokemon.stats?.find(s => s.name === statName);
    return stat ? stat.value : 0;
  };

  // Helper function to determine if a stat is the maximum
  const isMaxStat = (statName) => {
    if (!pokemon.stats || pokemon.stats.length === 0) return '';
    const maxValue = Math.max(...pokemon.stats.map(s => s.value));
    const statValue = getStatValue(statName);
    return statValue === maxValue ? 'max-stat' : '';
  };

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
      <div className="pokemon-header">
        <h1 className="pokemon-name">{pokemon.name}</h1>
        {pokemon.id && <span className="pokedex-number">#{pokemon.id}</span>}
      </div>

      <div className="pokemon-image-section">
        {pokemon.sprites?.default ? (
          <img
            src={showShiny && pokemon.sprites.shiny ? pokemon.sprites.shiny : pokemon.sprites.default}
            alt={`${pokemon.name} sprite`}
            className="pokemon-sprite"
            onClick={handleImageClick}
            title={showShiny ? "Click to show default sprite" : "Click to show shiny sprite"}
          />
        ) : (
          <div className="no-image-message">No image available</div>
        )}
        {pokemon.sprites?.shiny && (
          <div className="sprite-label">{showShiny ? "Shiny" : "Default"}</div>
        )}
      </div>

      <div className="pokemon-types">
        {pokemon.types && pokemon.types.map((type) => (
          <span key={type} className={`type-badge type-${type}`}>
            {type}
          </span>
        ))}
      </div>

      {pokemon.stats && pokemon.stats.length > 0 && (
        <div className="pokemon-info-section">
          <h2 className="section-title">Stats</h2>
          <div className="stats-table">
            <div className="stat-row">
              <div className={`stat-cell ${isMaxStat('hp')}`}>
                <span className="stat-name">HP</span>
                <span className="stat-value">{getStatValue('hp')}</span>
              </div>
              <div className={`stat-cell ${isMaxStat('speed')}`}>
                <span className="stat-name">Speed</span>
                <span className="stat-value">{getStatValue('speed')}</span>
              </div>
            </div>
            <div className="stat-row">
              <div className={`stat-cell ${isMaxStat('attack')}`}>
                <span className="stat-name">Attack</span>
                <span className="stat-value">{getStatValue('attack')}</span>
              </div>
              <div className={`stat-cell ${isMaxStat('defense')}`}>
                <span className="stat-name">Defense</span>
                <span className="stat-value">{getStatValue('defense')}</span>
              </div>
            </div>
            <div className="stat-row">
              <div className={`stat-cell ${isMaxStat('special-attack')}`}>
                <span className="stat-name">Special Attack</span>
                <span className="stat-value">{getStatValue('special-attack')}</span>
              </div>
              <div className={`stat-cell ${isMaxStat('special-defense')}`}>
                <span className="stat-name">Special Defense</span>
                <span className="stat-value">{getStatValue('special-defense')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {pokemon.abilities && pokemon.abilities.length > 0 && (
        <div className="pokemon-info-section">
          <h2 className="section-title">Abilities</h2>
          <div className="abilities-list">
            {pokemon.abilities.map((ability, index) => (
              <div key={index} className="ability-card" title={ability.effect}>
                <div className="ability-name">{ability.name}</div>
                <div className="ability-flavor">{ability.flavorText}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pokemon.evolution && (
        <div className="pokemon-info-section">
          <h2 className="section-title">Evolution</h2>
          <div className="evolution-navigation">
            <button
              className="evolution-btn pre-evolution"
              disabled={!pokemon.evolution.preEvolution}
              onClick={() => pokemon.evolution.preEvolution && onSelectPokemon(pokemon.evolution.preEvolution)}
            >
              {pokemon.evolution.preEvolution && (
                <>
                  <span className="evolution-arrow">←</span>
                  <span className="evolution-name">{pokemon.evolution.preEvolution}</span>
                </>
              )}
            </button>
            <button
              className="evolution-btn next-evolution"
              disabled={!pokemon.evolution.evolution}
              onClick={() => pokemon.evolution.evolution && onSelectPokemon(pokemon.evolution.evolution)}
            >
              {pokemon.evolution.evolution && (
                <>
                  <span className="evolution-name">{pokemon.evolution.evolution}</span>
                  <span className="evolution-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {pokemon.id && (
        <div className="pokemon-info-section">
          <h2 className="section-title">Basic Info</h2>
          <div className="basic-info">
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
