import React, {useEffect, useState} from 'react';
import api from '../util';

export default function AppleLeaderboard() {
  const [name, setName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const loadLeaderboard = () => {
    api('/apple/leaderboard')
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to load leaderboard.');
        }
        return response.json();
      })
      .then(data => {
        setLeaderboard(data);
      })
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleComplete = () => {
    if (!name.trim()) return;

    api('/apple/complete', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim()
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to enter leaderboard.');
        }
        return response.json();
      })
      .then(data => {
        if (!data.success) {
          setError('You have already completed this hunt.');
          return;
        }

        setCompleted(true);
        loadLeaderboard();
      })
      .catch(err => setError(err.message));
  };

  return (
    <div style={{padding: '10px'}}>
      <h1>Scavenger Hunt Leaderboard</h1>

      {!completed && (
        <>
          <p>You found all three paintings!</p>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={handleComplete}>
            Enter Leaderboard
          </button>
        </>
      )}

      {error && (
        <p style={{color: 'red'}}>{error}</p>
      )}

      <h2>Leaderboard</h2>

      {leaderboard.map((entry, index) => (
        <div key={index}>
          {entry.name} — {new Date(entry.completedAt).toLocaleDateString()}
        </div>
      ))}
    </div>
  );
}