import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  initializeGame, 
  selectTile,
  checkMatches,
  finishProcessing,
  resetGame,
  selectBoard, 
  selectGameStatus, 
  selectScore,
  selectRemainingMoves,
  selectSelectedTile,
  selectProcessing
} from '../store/gameSlice';
import './Game.css';
import Tile from './Tile';

function Game() {
  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const gameStatus = useSelector(selectGameStatus);
  const score = useSelector(selectScore);
  const remainingMoves = useSelector(selectRemainingMoves);
  const selectedTile = useSelector(selectSelectedTile);
  const processing = useSelector(selectProcessing);

  // Inicjalizacja gry
  useEffect(() => {
    if (gameStatus === 'idle') {
      dispatch(initializeGame({ rows: 8, cols: 8, maxMoves: 30 }));
    }
  }, [dispatch, gameStatus]);

  // Sprawdzanie dopasowań po każdej zamianie
  useEffect(() => {
    if (processing) {
      const timer = setTimeout(() => {
        dispatch(checkMatches());
      }, 300); // Daj czas na renderowanie UI
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, processing]);

  // Obsługa kliknięcia kafelka
  const handleTileClick = (row, col) => {
    if (gameStatus === 'playing' && !processing) {
      dispatch(selectTile({ row, col }));
    }
  };

  // Rozpocznij nową grę
  const startNewGame = () => {
    dispatch(resetGame());
    dispatch(initializeGame({ rows: 8, cols: 8, maxMoves: 30 }));
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="score">Wynik: {score}</div>
        <div className="moves">Pozostałe ruchy: {remainingMoves}</div>
      </div>

      {gameStatus === 'won' && (
        <div className="game-message">
          <h2>Gratulacje! Wygrałeś!</h2>
          <button onClick={startNewGame}>Zagraj ponownie</button>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="game-message">
          <h2>Koniec gry! Zabrakło ruchów.</h2>
          <button onClick={startNewGame}>Spróbuj ponownie</button>
        </div>
      )}

      <div className="game-board" 
           style={{ 
             display: 'grid',
             gridTemplateRows: `repeat(${board.length}, 1fr)`,
             gridTemplateColumns: `repeat(${board[0]?.length || 8}, 1fr)`,
             gap: '5px'
           }}>
        {board.flat().map((tile) => (
          <Tile 
            key={tile.id} 
            type={tile.type}
            isSelected={selectedTile?.id === tile.id}
            onClick={() => handleTileClick(tile.row, tile.col)}
          />
        ))}
      </div>
    </div>
  );
}

export default Game;