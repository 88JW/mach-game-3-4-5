import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tile from '../Tile/Tile';
import {
  selectTile,
  refillBoardAfterMatch,
  resetGame,
  selectBoard,
  selectScore,
  selectMovesLeft,
  selectSelectedTile,
  selectGameOver,
  selectMatchFound
} from '../../store/gameSlice';
import './Game.css';

const Game = () => {
  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const score = useSelector(selectScore);
  const movesLeft = useSelector(selectMovesLeft);
  const selectedTile = useSelector(selectSelectedTile);
  const gameOver = useSelector(selectGameOver);
  const matchFound = useSelector(selectMatchFound);

  useEffect(() => {
    if (matchFound) {
      // Wait a bit to show the matches before refilling
      const timeoutId = setTimeout(() => {
        dispatch(refillBoardAfterMatch());
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [matchFound, dispatch]);

  const handleTileClick = (row, col) => {
    if (!gameOver) {
      dispatch(selectTile({ row, col }));
    }
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="score">Score: {score}</div>
        <div className="moves">Moves Left: {movesLeft}</div>
        <button className="reset-button" onClick={() => dispatch(resetGame())}>
          Reset Game
        </button>
      </div>

      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((tile, colIndex) => (
              <Tile
                key={tile.id}
                color={tile.color}
                selected={
                  selectedTile &&
                  selectedTile.row === rowIndex &&
                  selectedTile.col === colIndex
                }
                onClick={() => handleTileClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={() => dispatch(resetGame())}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default Game;
