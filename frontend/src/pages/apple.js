import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../util';

export default function Apple({paintingId}) {
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
    return <div style={{padding: '10px'}}>{error}</div>;
  }

  if (!status) {
    return <div style={{padding: '10px'}}>Loading...</div>;
  }

  return (
    <div style={{padding: '10px'}}>
      <h1>Painting {paintingId}</h1>
      <p>Placeholder content for now.</p>

      <p>
        You've found {status.visited.length} of 3 paintings.
      </p>

      {status.complete && (
        <button onClick={() => navigate('/secret/leaderboard')}>
          Enter the leaderboard
        </button>
      )}
    </div>
  );
}