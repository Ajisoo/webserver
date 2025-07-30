const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require("dotenv").config();
const fs = require("fs");

const DOMAIN_URL = process.env.DOMAIN_URL;

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket server error handling
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('*', (req,res,next) => res.sendFile(path.join(__dirname, 'index.html')));

const createBoard = () => {
  const board = [];
  for (let y = 0; y < 25; y += 1) {
    board.push(new Array(50).fill(0));
  }
  return board;
};

// Game state
const gameState = {
  players: new Map(),
  gameStarted: false,
  sharedBoard: createBoard(), // Single shared board
  currentPieces: new Map(), // Each player has their own piece
  gameOver: false,
  score: 0,
  level: 1,
  lines: 0
};

// Tetris piece shapes
const TETROMINOS = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
    ],
    color: '80, 227, 230',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
    ],
    color: '36, 95, 223',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
    ],
    color: '223, 173, 36',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: '223, 217, 36',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
    ],
    color: '48, 211, 56',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0],
    ],
    color: '132, 61, 198',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
    ],
    color: '227, 78, 78',
  },
};

const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

// Calculate starting position for a player based on player count and index
const getStartingPosition = (playerIndex, totalPlayers) => {
  const boardWidth = 50;
  const spacing = Math.floor(boardWidth / totalPlayers);
  const startX = Math.floor(playerIndex * spacing) + Math.floor(spacing / 2);
  return { x: startX, y: 0 };
};

const checkCollision = (piece, board, moveX = 0, moveY = 0) => {
  for (let y = 0; y < piece.tetromino.shape.length; y += 1) {
    for (let x = 0; x < piece.tetromino.shape[y].length; x += 1) {
      if (piece.tetromino.shape[y][x] !== 0) {
        const boardY = y + piece.pos.y + moveY;
        const boardX = x + piece.pos.x + moveX;
        
        // Check bounds
        if (boardY < 0 || boardY >= board.length || 
            boardX < 0 || boardX >= board[0].length) {
          return true;
        }
        
        // Check if cell is occupied
        if (board[boardY][boardX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
};

// Check if a piece collides with any other pieces
const checkPieceCollision = (piece, otherPieces, moveX = 0, moveY = 0, excludePiece = null) => {
  for (const [otherPlayerId, otherPiece] of otherPieces) {
    if (!otherPiece || otherPiece === excludePiece) continue;
    
    // Check if this piece overlaps with the other piece
    for (let y = 0; y < piece.tetromino.shape.length; y += 1) {
      for (let x = 0; x < piece.tetromino.shape[y].length; x += 1) {
        if (piece.tetromino.shape[y][x] !== 0) {
          const pieceY = y + piece.pos.y + moveY;
          const pieceX = x + piece.pos.x + moveX;
          
          // Check against other piece's shape
          for (let oy = 0; oy < otherPiece.tetromino.shape.length; oy += 1) {
            for (let ox = 0; ox < otherPiece.tetromino.shape[oy].length; ox += 1) {
              if (otherPiece.tetromino.shape[oy][ox] !== 0) {
                const otherY = oy + otherPiece.pos.y;
                const otherX = ox + otherPiece.pos.x;
                
                if (pieceY === otherY && pieceX === otherX) {
                  return true; // Collision detected
                }
              }
            }
          }
        }
      }
    }
  }
  return false;
};

const dropPiece = (playerId, isTimerTriggered = false) => {
  const piece = gameState.currentPieces.get(playerId);
  
  if (!piece || gameState.gameOver) return;

  // Try to move piece down
  if (checkPieceCollision(piece, gameState.currentPieces, 0, 1) && !isTimerTriggered) {
    // Do nothing, we are colliding with another falling piece  
    return;
  } else if (!checkCollision(piece, gameState.sharedBoard, 0, 1)) {
    // Move piece down
    gameState.currentPieces.set(playerId, {
      ...piece,
      pos: { x: piece.pos.x, y: piece.pos.y + 1 }
    });
  } else {
    // Piece has landed, add it to the shared board
    piece.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + piece.pos.y;
          const boardX = x + piece.pos.x;
          if (boardY >= 0 && boardY < gameState.sharedBoard.length && 
              boardX >= 0 && boardX < gameState.sharedBoard[0].length) {
            gameState.sharedBoard[boardY][boardX] = value;
          }
        }
      });
    });

    // Check for completed lines
    const linesCleared = gameState.sharedBoard.reduce((acc, row) => {
      if (row.findIndex(cell => cell === 0) === -1) {
        return acc + 1;
      }
      return acc;
    }, 0);

    // Remove completed lines and update score
    if (linesCleared > 0) {
      for (let i = 0; i < linesCleared; i++) {
        gameState.sharedBoard.splice(gameState.sharedBoard.findIndex(row => row.findIndex(cell => cell === 0) === -1), 1);
        gameState.sharedBoard.unshift(new Array(50).fill(0));
      }
      gameState.lines += linesCleared;
      gameState.score += linesCleared * 100;
      gameState.level = Math.floor(gameState.lines / 10) + 1;
    }
    
    // Create new piece for this player
    const playerIndex = Array.from(gameState.players.keys()).indexOf(playerId);
    const totalPlayers = gameState.players.size;
    const startPos = getStartingPosition(playerIndex, totalPlayers);
    
    const newPiece = {
      pos: startPos,
      tetromino: randomTetromino(),
      collided: false,
    };
    
    // Check if the new piece can be placed
    if (checkCollision(newPiece, gameState.sharedBoard, 0, 0)) {
      gameState.gameOver = true;
      broadcastGameState();
      // Restart game after 5 seconds
      setTimeout(() => {
        resetGame();
      }, 5000);
    } else {
      gameState.currentPieces.set(playerId, newPiece);
    }
  }
};

const resetGame = () => {
  gameState.gameOver = false;
  gameState.score = 0;
  gameState.level = 1;
  gameState.lines = 0;
  
  // Reset shared board
  gameState.sharedBoard = createBoard();
  
  // Reset all player pieces with proper starting positions
  const playerIds = Array.from(gameState.players.keys());
  playerIds.forEach((playerId, index) => {
    const startPos = getStartingPosition(index, playerIds.length);
    gameState.currentPieces.set(playerId, {
      pos: startPos,
      tetromino: randomTetromino(),
      collided: false,
    });
  });
  
  broadcastGameState();
};

const broadcastGameState = () => {
  const gameData = {
    type: 'gameState',
    players: Array.from(gameState.players.values()),
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    score: gameState.score,
    level: gameState.level,
    lines: gameState.lines,
    sharedBoard: gameState.sharedBoard,
    currentPieces: Object.fromEntries(gameState.currentPieces)
  };

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(gameData));
    }
  });
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  const playerId = Date.now() + Math.random();
  const playerName = `Player ${gameState.players.size + 1}`;
  
  gameState.players.set(playerId, {
    id: playerId,
    name: playerName
  });

  // Initialize player's piece with proper starting position
  const playerIndex = gameState.players.size - 1; // New player gets the last index
  const startPos = getStartingPosition(playerIndex, gameState.players.size);
  const initialPiece = {
    pos: startPos,
    tetromino: randomTetromino(),
    collided: false,
  };
  gameState.currentPieces.set(playerId, initialPiece);

  // Send initial game state
  ws.send(JSON.stringify({
    type: 'playerJoined',
    playerId: playerId,
    playerName: playerName
  }));

  broadcastGameState();

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'startGame':
          gameState.gameStarted = true;
          broadcastGameState();
          break;
          
                 case 'movePiece':
           if (!gameState.gameStarted || gameState.gameOver) return;
           
           const piece = gameState.currentPieces.get(playerId);
           
           if (!piece) return;
           
           let moved = false;
           
           if (data.direction === 'left') {
             if (!checkCollision(piece, gameState.sharedBoard, -1, 0) && 
                 !checkPieceCollision(piece, gameState.currentPieces, -1, 0)) {
               gameState.currentPieces.set(playerId, {
                 ...piece,
                 pos: { x: piece.pos.x - 1, y: piece.pos.y }
               });
               moved = true;
             }
           } else if (data.direction === 'right') {
             if (!checkCollision(piece, gameState.sharedBoard, 1, 0) && 
                 !checkPieceCollision(piece, gameState.currentPieces, 1, 0)) {
               gameState.currentPieces.set(playerId, {
                 ...piece,
                 pos: { x: piece.pos.x + 1, y: piece.pos.y }
               });
               moved = true;
             }
           } else if (data.direction === 'down') {
             if (!checkCollision(piece, gameState.sharedBoard, 0, 1) && 
                 !checkPieceCollision(piece, gameState.currentPieces, 0, 1)) {
               gameState.currentPieces.set(playerId, {
                 ...piece,
                 pos: { x: piece.pos.x, y: piece.pos.y + 1 }
               });
               moved = true;
             } else {
               dropPiece(playerId);
             }
           } else if (data.direction === 'rotate') {
             const rotated = {
               ...piece,
               tetromino: {
                 ...piece.tetromino,
                 shape: piece.tetromino.shape[0].map((_, index) =>
                   piece.tetromino.shape.map(row => row[index]).reverse()
                 ),
               },
             };
             
             if (!checkCollision(rotated, gameState.sharedBoard) && 
                 !checkPieceCollision(rotated, gameState.currentPieces, 0, 0, piece)) {
               gameState.currentPieces.set(playerId, rotated);
               moved = true;
             }
           }
           
           if (moved) {
             broadcastGameState();
           }
           break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    gameState.players.delete(playerId);
    gameState.currentPieces.delete(playerId);
    
    // If no players left, reset game
    if (gameState.players.size === 0) {
      gameState.gameStarted = false;
      gameState.gameOver = false;
    }
    
    broadcastGameState();
  });
});

// Game loop for automatic piece dropping with sorted drop order
setInterval(() => {
  if (gameState.gameStarted && !gameState.gameOver) {
    // Sort pieces by bottom-up (highest Y position first) to prevent collisions
    const sortedPlayers = Array.from(gameState.currentPieces.entries())
      .sort((a, b) => b[1].pos.y - a[1].pos.y);
    
    sortedPlayers.forEach(([playerId, piece]) => {
      dropPiece(playerId, true);
    });
    broadcastGameState();
  }
}, 1000);

server.listen(3000, () => {
  console.log("React Server with WebSocket started at port 3000");
});
