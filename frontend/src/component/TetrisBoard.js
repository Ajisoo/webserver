import React from 'react';

export default function TetrisBoard({board}) {
  return (
    <div className="tetris-board">
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`board-cell ${cell !== 0 ? 'filled' : ''}`}
              style={{
                backgroundColor: cell !== 0 ? `rgb(${getCellColor(cell)})` : 'transparent',
                border: '1px solid #333'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const getCellColor = (cell) => {
  const colors = {
    'I': '80, 227, 230',
    'J': '36, 95, 223',
    'L': '223, 173, 36',
    'O': '223, 217, 36',
    'S': '48, 211, 56',
    'T': '132, 61, 198',
    'Z': '227, 78, 78'
  };
  return colors[cell] || '0, 0, 0';
} 