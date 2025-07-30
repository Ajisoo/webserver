import React, { useState, useEffect, useRef } from 'react';
import TetrisGame from '../component/TetrisGame';

export default function Tetris() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [sharedBoard, setSharedBoard] = useState([]);
  const [currentPieces, setCurrentPieces] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [playerId, setPlayerId] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket(`wss://${window.location.hostname}/socket`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to game server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'playerJoined':
          setPlayerId(data.playerId);
          break;
          
        case 'gameState':
          console.log('Received game state:', data);
          setPlayers(data.players || []);
          setGameStarted(data.gameStarted || false);
          setSharedBoard(data.sharedBoard || []);
          setCurrentPieces(data.currentPieces || {});
          // Handle both boolean and object gameOver (for backward compatibility)
          const gameOverState = typeof data.gameOver === 'boolean' ? data.gameOver : false;
          setGameOver(gameOverState);
          setScore(data.score || 0);
          setLevel(data.level || 1);
          setLines(data.lines || 0);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from game server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const startGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'startGame' }));
    }
  };

  const joinGame = () => {
    // Player automatically joins when connecting to WebSocket
    console.log('Player joined game');
  };

  const sendMove = (direction) => {
    console.log('Sending move:', direction);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'movePiece',
        direction: direction
      }));
    }
  };

  return (
    <div className="tetris-page">
      <h1>Multiplayer Tetris</h1>
      
      {!connected && (
        <div className="connection-status">
          <p>Connecting to game server...</p>
        </div>
      )}
      
      {connected && !gameStarted ? (
        <div className="game-lobby">
          <h2>Game Lobby</h2>
          <div className="player-list">
            <h3>Connected Players ({players.length})</h3>
            {players.map(player => (
              <div key={player.id} className="player-item">
                <span>{player.name}</span>
                <span>Score: {player.score}</span>
              </div>
            ))}
          </div>
          
          <div className="lobby-controls">
            <button onClick={joinGame} className="join-btn" disabled>
              Auto-Joined
            </button>
            {players.length > 0 && (
              <button onClick={startGame} className="start-btn">
                Start Game
              </button>
            )}
          </div>
        </div>
      ) : connected && gameStarted ? (
                 <TetrisGame 
           players={players} 
           sharedBoard={sharedBoard}
           currentPieces={currentPieces}
           gameOver={gameOver}
           score={score}
           level={level}
           lines={lines}
           onMove={sendMove}
         />
      ) : null}
    </div>
  );
} 