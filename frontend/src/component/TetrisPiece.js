import React from 'react';

export default function TetrisPiece({ piece }) {
  if (!piece || !piece.tetromino) return null;

  const { tetromino, pos } = piece;

  return (
    <div className="tetris-piece" style={{ position: 'absolute', top: 0, left: 0 }}>
      {tetromino.shape.map((row, y) => (
        <div key={y} className="piece-row">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`piece-cell ${cell !== 0 ? 'filled' : ''}`}
              style={{
                backgroundColor: cell !== 0 ? `rgb(${tetromino.color})` : 'transparent',
                border: cell !== 0 ? '1px solid #333' : 'none',
                position: 'absolute',
                top: `${(y + pos.y) * 20}px`,
                left: `${(x + pos.x) * 20}px`,
                width: '20px',
                height: '20px',
                boxSizing: 'border-box'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
} 