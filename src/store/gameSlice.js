import { createSlice } from '@reduxjs/toolkit';

// Colors for the game elements
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// Helper function to create a random board
const createBoard = (rows, cols) => {
  const board = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        id: `${i}-${j}`, // unique id for each tile
      });
    }
    board.push(row);
  }
  return board;
};

// Helper function to check if there are matches on the board
const checkMatches = (board) => {
  const rows = board.length;
  const cols = board[0].length;
  let matches = [];

  // Check horizontal matches
  for (let i = 0; i < rows; i++) {
    let count = 1;
    for (let j = 1; j < cols; j++) {
      if (board[i][j].color === board[i][j - 1].color) {
        count++;
      } else {
        if (count >= 3) {
          for (let k = j - count; k < j; k++) {
            matches.push({ row: i, col: k });
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let k = cols - count; k < cols; k++) {
        matches.push({ row: i, col: k });
      }
    }
  }

  // Check vertical matches
  for (let j = 0; j < cols; j++) {
    let count = 1;
    for (let i = 1; i < rows; i++) {
      if (board[i][j].color === board[i - 1][j].color) {
        count++;
      } else {
        if (count >= 3) {
          for (let k = i - count; k < i; k++) {
            matches.push({ row: k, col: j });
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let k = rows - count; k < rows; k++) {
        matches.push({ row: k, col: j });
      }
    }
  }

  return matches;
};

// Helper function to refill the board after matches
const refillBoard = (board) => {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = JSON.parse(JSON.stringify(board));

  // Move tiles down to fill gaps
  for (let j = 0; j < cols; j++) {
    let gapCount = 0;
    for (let i = rows - 1; i >= 0; i--) {
      if (newBoard[i][j].color === null) {
        gapCount++;
      } else if (gapCount > 0) {
        newBoard[i + gapCount][j].color = newBoard[i][j].color;
        newBoard[i][j].color = null;
      }
    }
    
    // Fill the top with new tiles
    for (let i = 0; i < rows; i++) {
      if (newBoard[i][j].color === null) {
        newBoard[i][j].color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }
  }

  return newBoard;
};

const initialState = {
  board: createBoard(8, 8),
  selectedTile: null,
  score: 0,
  movesLeft: 30,
  gameOver: false,
  matchFound: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectTile: (state, action) => {
      const { row, col } = action.payload;
      
      // If there's already a selected tile and it's adjacent to the new selection
      if (state.selectedTile) {
        const { row: prevRow, col: prevCol } = state.selectedTile;
        const isAdjacent = 
          (Math.abs(row - prevRow) === 1 && col === prevCol) || 
          (Math.abs(col - prevCol) === 1 && row === prevRow);
        
        if (isAdjacent) {
          // Swap the tiles
          const temp = state.board[row][col].color;
          state.board[row][col].color = state.board[prevRow][prevCol].color;
          state.board[prevRow][prevCol].color = temp;
          
          // Check if the move creates a match
          const matches = checkMatches(state.board);
          
          if (matches.length > 0) {
            // Valid move, remove matches
            matches.forEach(match => {
              state.board[match.row][match.col].color = null;
            });
            
            state.score += matches.length * 10;
            state.movesLeft -= 1;
            state.matchFound = true;
          } else {
            // Invalid move, swap back
            const temp = state.board[row][col].color;
            state.board[row][col].color = state.board[prevRow][prevCol].color;
            state.board[prevRow][prevCol].color = temp;
          }
          
          state.selectedTile = null;
        } else {
          // Select new tile instead
          state.selectedTile = { row, col };
        }
      } else {
        // First tile selection
        state.selectedTile = { row, col };
      }
      
      // Check if game is over
      if (state.movesLeft <= 0) {
        state.gameOver = true;
      }
    },
    
    refillBoardAfterMatch: (state) => {
      if (state.matchFound) {
        state.board = refillBoard(state.board);
        
        // Check for cascading matches
        const newMatches = checkMatches(state.board);
        if (newMatches.length > 0) {
          newMatches.forEach(match => {
            state.board[match.row][match.col].color = null;
          });
          state.score += newMatches.length * 10;
          state.matchFound = true;
        } else {
          state.matchFound = false;
        }
      }
    },
    
    resetGame: (state) => {
      state.board = createBoard(8, 8);
      state.selectedTile = null;
      state.score = 0;
      state.movesLeft = 30;
      state.gameOver = false;
      state.matchFound = false;
    }
  },
});

export const { selectTile, refillBoardAfterMatch, resetGame } = gameSlice.actions;

export const selectBoard = (state) => state.game.board;
export const selectScore = (state) => state.game.score;
export const selectMovesLeft = (state) => state.game.movesLeft;
export const selectSelectedTile = (state) => state.game.selectedTile;
export const selectGameOver = (state) => state.game.gameOver;
export const selectMatchFound = (state) => state.game.matchFound;

export default gameSlice.reducer;
