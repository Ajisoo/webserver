import React, {useEffect, useCallback} from 'react';
import TetrisBoard from './TetrisBoard';
import TetrisPiece from './TetrisPiece';

export default function TetrisGame({players, sharedBoard, currentPieces, gameOver, score, level, lines, onMove}) {
  const handleKeyPress = useCallback((event) => {
    event.preventDefault();
    if (event.keyCode === 37) {
      // Left arrow
      onMove('left');
    } else if (event.keyCode === 39) {
      // Right arrow
      onMove('right');
    } else if (event.keyCode === 40) {
      // Down arrow
      onMove('down');
    } else if (event.keyCode === 38) {
      // Up arrow
      onMove('rotate');
    }
  }, [onMove]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="tetris-game">
      <div className="game-stats">
        <div className="stat-item">
          <span>Score: {score}</span>
        </div>
        <div className="stat-item">
          <span>Level: {level}</span>
        </div>
        <div className="stat-item">
          <span>Lines: {lines}</span>
        </div>
      </div>

      <div className="game-container">
        <div className="shared-game">
          <h3>Shared Board</h3>
          <div className="game-board">
            <TetrisBoard board={sharedBoard}/>
            {players.map(player => (
              <TetrisPiece key={player.id} piece={currentPieces[player.id]}/>
            ))}
          </div>
          <div className="player-info">
            {players.map(player => (
              <div key={player.id} className="player-item">
                <span>{player.name}</span>
                <span>Piece: {currentPieces[player.id]?.tetromino?.shape ? 'Active' : 'Waiting'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h4>Game Over! Restarting in 5 seconds...</h4>
        </div>
      )}

      <div className="game-controls">
        <p>Controls:</p>
        <p>← → : Move left/right</p>
        <p>↓ : Move down</p>
        <p>↑ : Rotate piece</p>
      </div>
    </div>
  );
} 