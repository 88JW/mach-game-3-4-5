import React from 'react';

// Mapowanie typów na kolory
const TILE_COLORS = {
  red: '#FF5252',
  green: '#4CAF50',
  blue: '#2196F3',
  yellow: '#FFC107',
  purple: '#9C27B0',
  orange: '#FF9800'
};

function Tile({ type, isSelected, onClick }) {
  return (
    <div 
      className={`tile ${isSelected ? 'selected' : ''}`}
      style={{ 
        backgroundColor: TILE_COLORS[type],
        transform: isSelected ? 'scale(0.9)' : 'scale(1)'
      }}
      onClick={onClick}
    />
  );
}

export default Tile;
