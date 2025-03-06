import React from 'react';
import './Tile.css';

const Tile = ({ color, selected, onClick }) => {
  return (
    <div 
      className={`tile ${color} ${selected ? 'selected' : ''}`} 
      onClick={onClick}
    />
  );
};

export default Tile;
