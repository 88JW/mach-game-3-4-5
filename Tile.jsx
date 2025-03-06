import React from 'react';

function Tile({ image }) {
  return (
    <img src={image} className="tile-image" alt="Tile" />
  );
}

export default Tile;