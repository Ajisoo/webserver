import React, {useEffect, useState} from 'react';
import api from '../util';
import './appleLeaderboard.css';

export default function AppleLeaderboard() {
  const [name, setName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const loadLeaderboard = () => {
    api('/apple/leaderboard')
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to load the record.');
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

    setError('');

    api('/apple/complete', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim()
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to record achievement.');
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
    <main className="apple-record-page">

      <div className="record-geometry record-geometry-circle" />
      <div className="record-geometry record-geometry-square" />

      <div className="record-content">

        <div className="record-symbol" aria-hidden="true">
          <div className="record-stem" />
          <div className="record-leaf" />
          <div className="record-fruit" />
        </div>

        <header className="record-header">
          <div className="record-label">THE RECORD</div>

          <h1>
            Some achievements<br />
            must be recorded.
          </h1>
        </header>

        {!completed && (
          <section className="record-entry">

            <p className="record-introduction">
              You have found them all.
              <br />
              It is now necessary to provide a name.
            </p>

            <div className="record-form">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                maxLength={50}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleComplete();
                  }
                }}
              />

              <button onClick={handleComplete}>
                <span>Enter the record</span>
                <span className="record-arrow">→</span>
              </button>
            </div>

          </section>
        )}

        {completed && (
          <section className="record-confirmation">
            <p>
              Your achievement has been recorded.
            </p>
          </section>
        )}

        {error && (
          <div className="record-error">
            {error}
          </div>
        )}

        <section className="leaderboard">

          <div className="leaderboard-heading">
            <span>NAME</span>
            <span>DATE</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="leaderboard-empty">
              No achievements have been recorded.
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div className="leaderboard-entry" key={index}>
                <span className="leaderboard-rank">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="leaderboard-name">
                  {entry.name}
                </span>

                <span className="leaderboard-date">
                  {new Date(entry.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}

        </section>

      </div>
    </main>
  );
}