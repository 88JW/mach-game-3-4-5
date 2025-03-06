import { createSlice } from '@reduxjs/toolkit';

// Typy elementów (dla uproszczenia używamy symboli kolorowych)
const TILE_TYPES = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

// Generowanie losowej planszy
const generateBoard = (rows, cols) => {
  const board = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Losowy typ elementu
      const randomIndex = Math.floor(Math.random() * TILE_TYPES.length);
      row.push({
        id: `${i}-${j}`,
        type: TILE_TYPES[randomIndex],
        row: i,
        col: j,
        isMatched: false,
        isAnimating: false
      });
    }
    board.push(row);
  }
  return board;
};

// Sprawdzenie czy dwa elementy są sąsiednie
const areAdjacent = (tile1, tile2) => {
  const rowDiff = Math.abs(tile1.row - tile2.row);
  const colDiff = Math.abs(tile1.col - tile2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// Znajdowanie dopasowań na planszy
const findMatches = (board) => {
  const matches = [];
  const rows = board.length;
  const cols = board[0].length;
  
  // Sprawdzenie dopasowań poziomych
  for (let i = 0; i < rows; i++) {
    let matchCount = 1;
    let currentType = null;
    
    for (let j = 0; j < cols; j++) {
      const tile = board[i][j];
      
      if (j === 0 || tile.type !== currentType) {
        if (matchCount >= 3) {
          // Dodaj poprzednie dopasowanie
          const matchIndices = [];
          for (let k = j - matchCount; k < j; k++) {
            matchIndices.push({ row: i, col: k });
          }
          matches.push(matchIndices);
        }
        
        // Resetuj licznik dla nowego typu
        currentType = tile.type;
        matchCount = 1;
      } else {
        matchCount++;
      }
    }
    
    // Sprawdź ostatnie dopasowanie w wierszu
    if (matchCount >= 3) {
      const matchIndices = [];
      for (let k = cols - matchCount; k < cols; k++) {
        matchIndices.push({ row: i, col: k });
      }
      matches.push(matchIndices);
    }
  }
  
  // Sprawdzenie dopasowań pionowych
  for (let j = 0; j < cols; j++) {
    let matchCount = 1;
    let currentType = null;
    
    for (let i = 0; i < rows; i++) {
      const tile = board[i][j];
      
      if (i === 0 || tile.type !== currentType) {
        if (matchCount >= 3) {
          // Dodaj poprzednie dopasowanie
          const matchIndices = [];
          for (let k = i - matchCount; k < i; k++) {
            matchIndices.push({ row: k, col: j });
          }
          matches.push(matchIndices);
        }
        
        // Resetuj licznik dla nowego typu
        currentType = tile.type;
        matchCount = 1;
      } else {
        matchCount++;
      }
    }
    
    // Sprawdź ostatnie dopasowanie w kolumnie
    if (matchCount >= 3) {
      const matchIndices = [];
      for (let k = rows - matchCount; k < rows; k++) {
        matchIndices.push({ row: k, col: j });
      }
      matches.push(matchIndices);
    }
  }
  
  return matches;
};

// Usuwanie dopasowań i przesuwanie elementów w dół
const removeMatchesAndShift = (board, matches) => {
  const newBoard = JSON.parse(JSON.stringify(board));
  const rows = newBoard.length;
  const cols = newBoard[0].length;
  
  // Oznacz dopasowane elementy
  matches.flat().forEach(({ row, col }) => {
    newBoard[row][col].isMatched = true;
  });
  
  // Przesunięcie elementów w dół i dodanie nowych
  for (let j = 0; j < cols; j++) {
    let emptySpaces = 0;
    
    // Od dołu do góry
    for (let i = rows - 1; i >= 0; i--) {
      if (newBoard[i][j].isMatched) {
        emptySpaces++;
        newBoard[i][j].isMatched = false;
      } else if (emptySpaces > 0) {
        // Przesuń element w dół
        newBoard[i + emptySpaces][j] = { ...newBoard[i][j], row: i + emptySpaces };
      }
    }
    
    // Wypełnij górne pozycje nowymi elementami
    for (let i = 0; i < emptySpaces; i++) {
      const randomIndex = Math.floor(Math.random() * TILE_TYPES.length);
      newBoard[i][j] = {
        id: `new-${i}-${j}-${Date.now()}`,
        type: TILE_TYPES[randomIndex],
        row: i,
        col: j,
        isMatched: false,
        isAnimating: false
      };
    }
  }
  
  return newBoard;
};

// Funkcja do cofania zamiany elementów
const swapTiles = (board, tile1, tile2) => {
  const newBoard = JSON.parse(JSON.stringify(board));
  const { row: row1, col: col1 } = tile1;
  const { row: row2, col: col2 } = tile2;
  
  // Zamiana elementów
  const temp = { ...newBoard[row1][col1] };
  newBoard[row1][col1] = { ...newBoard[row2][col2], row: row1, col: col1 };
  newBoard[row2][col2] = { ...temp, row: row2, col: col2 };
  
  return newBoard;
};

const initialState = {
  board: [], // Plansza z elementami
  rows: 8,
  cols: 8,
  selectedTile: null, // Aktualnie zaznaczony element
  score: 0,
  moves: 0,
  remainingMoves: 30,
  gameStatus: 'idle', // 'idle', 'playing', 'won', 'lost'
  processing: false, // Flaga czy trwa przetwarzanie (dopasowania, animacja itd.)
  lastSwappedTiles: null, // Zapamiętanie ostatniej zamiany dla możliwości cofnięcia
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Inicjalizacja nowej gry
    initializeGame: (state, action) => {
      const { rows = 8, cols = 8, maxMoves = 30 } = action.payload || {};
      const board = generateBoard(rows, cols);
      
      return {
        ...initialState,
        board,
        rows,
        cols,
        remainingMoves: maxMoves,
        gameStatus: 'playing'
      };
    },
    
    // Wybór elementu (pierwszy zaznaczony lub zamiana)
    selectTile: (state, action) => {
      const { row, col } = action.payload;
      
      if (state.processing || state.gameStatus !== 'playing') return;
      
      const selectedTile = state.board[row][col];
      
      // Jeśli to pierwszy zaznaczony element
      if (!state.selectedTile) {
        state.selectedTile = selectedTile;
        return;
      }
      
      // Jeśli kliknięto ten sam element, usuń zaznaczenie
      if (state.selectedTile.id === selectedTile.id) {
        state.selectedTile = null;
        return;
      }
      
      // Jeśli elementy są sąsiednie, spróbuj zamienić
      if (areAdjacent(state.selectedTile, selectedTile)) {
        // Zapamiętaj zamienione elementy do ewentualnego cofnięcia
        state.lastSwappedTiles = {
          tile1: { ...state.selectedTile },
          tile2: { ...selectedTile }
        };
        
        // Zamień elementy miejscami
        const { row: row1, col: col1 } = state.selectedTile;
        const temp = { ...state.board[row][col] };
        
        // Aktualizuj pozycje
        state.board[row][col] = { 
          ...state.board[row1][col1], 
          row, 
          col 
        };
        state.board[row1][col1] = { 
          ...temp, 
          row: row1, 
          col: col1 
        };
        
        state.processing = true;
        state.selectedTile = null;
        state.moves += 1;
        state.remainingMoves -= 1;
      } else {
        // Jeśli nie są sąsiednie, zmień zaznaczenie
        state.selectedTile = selectedTile;
      }
    },
    
    // Sprawdź dopasowania
    checkMatches: (state) => {
      if (state.gameStatus !== 'playing' || !state.processing) return;
      
      const matches = findMatches(state.board);
      
      // Jeśli są dopasowania
      if (matches.length > 0) {
        // Przyznaj punkty (10 za każdy dopasowany element)
        const matchedCount = matches.flat().length;
        state.score += matchedCount * 10;
        
        // Usuń dopasowania i przesuń elementy
        state.board = removeMatchesAndShift(state.board, matches);
        
        // Zachowaj flagę processing, aby sprawdzić ponowne dopasowania
        // w kolejnych wywołaniach checkMatches (efekt kaskadowy)
      } else {
        // Jeśli nie ma dopasowań i była to pierwsza próba po zamianie
        if (state.lastSwappedTiles) {
          // Cofnij zamianę, jeśli nie doprowadziła do dopasowań
          state.board = swapTiles(
            state.board, 
            state.lastSwappedTiles.tile1, 
            state.lastSwappedTiles.tile2
          );
          
          // Zwróć wykorzystany ruch
          state.moves -= 1;
          state.remainingMoves += 1;
          
          // Wyczyść informację o zamianie
          state.lastSwappedTiles = null;
        }
        
        // Jeśli nie ma dopasowań, zakończ przetwarzanie
        state.processing = false;
      }
      
      // Resetujemy informacje o ostatniej zamianie po udanym dopasowaniu
      if (matches.length > 0) {
        state.lastSwappedTiles = null;
      }
      
      // Sprawdź czy gra się skończyła
      if (state.remainingMoves <= 0) {
        state.gameStatus = 'lost';
        state.processing = false;
      }
      
      // Można dodać warunek wygranej, np. osiągnięcie określonej liczby punktów
      if (state.score >= 1000) {
        state.gameStatus = 'won';
        state.processing = false;
      }
    },
    
    // Zakończenie przetwarzania (animacji, przesunięć)
    finishProcessing: (state) => {
      state.processing = false;
    },
    
    // Resetowanie gry
    resetGame: () => initialState
  }
});

export const { 
  initializeGame, 
  selectTile, 
  checkMatches, 
  finishProcessing, 
  resetGame 
} = gameSlice.actions;

export default gameSlice.reducer;

// Selektory
export const selectBoard = (state) => state.game.board;
export const selectGameStatus = (state) => state.game.gameStatus;
export const selectScore = (state) => state.game.score;
export const selectMoves = (state) => state.game.moves;
export const selectRemainingMoves = (state) => state.game.remainingMoves;
export const selectSelectedTile = (state) => state.game.selectedTile;
export const selectProcessing = (state) => state.game.processing;
