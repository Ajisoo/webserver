import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../util';
import './apple.css';

const APPLE_TEXT = {
  1: [
    'Congratulations.',
    'You have discovered an apple.',
    'Maybe you can discover another.'
  ],

  2: [
    'You have found another apple.',
    'You are making progress.',
    'Perhaps there is a third.'
  ],

  3: [
    'You have found 3 apples.',
    'This is an achievement of great significance.',
    'And achievements must be recorded.',
  ]
};

export default function Apple({ paintingId }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api(`/apple/visit/${paintingId}`, {
      method: 'POST'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to record painting visit.');
        }

        return response.json();
      })
      .then(data => {
        setStatus(data);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [paintingId]);

  if (error) {
    return (
      <main className="apple-page">
        <div className="apple-error">
          {error}
        </div>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="apple-page">
        <div className="apple-loading">
          <span>·</span>
        </div>
      </main>
    );
  }

  const numFound = status.visited.length;
  const text = APPLE_TEXT[numFound] || APPLE_TEXT[1];

  return (
    <main className="apple-page">

      {/* Subtle abstract geometry */}
      <div className="geometry geometry-circle" />
      <div className="geometry geometry-square" />

      <div className="apple-content">

        {/* Small apple mark */}
        <div className="apple-symbol" aria-hidden="true">
          <div className="apple-stem" />
          <div className="apple-leaf" />
          <div className="apple-fruit" />
        </div>

        {/* Main writing */}
        <section className="apple-text">
          {text.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </section>

        {/* Bottom progress area */}
        <div className="apple-progress">

          {/* Apple progress sequence */}
          <div
            className="apple-sequence"
            aria-label={`${numFound} of 3 apples found`}
          >
            {[1, 2, 3].map((number, index) => (
              <React.Fragment key={number}>
                <span
                  className={`sequence-number ${
                    number <= numFound ? 'collected' : 'uncollected'
                  }`}
                >
                  {number}
                </span>

                {index < 2 && (
                  <span
                    className={`sequence-line ${
                      number < numFound ? 'collected' : 'uncollected'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Only show the action after all three have been found */}
          {status.complete && (
            <button
              className="apple-button"
              onClick={() => navigate('/secret/leaderboard')}
            >
              <span>Record your achievement</span>
              <span className="button-arrow">→</span>
            </button>
          )}

        </div>

      </div>
    </main>
  );
}