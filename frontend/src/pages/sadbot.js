import React, { useState, useEffect } from 'react';
import api from "../util";
import './admin.css';

export default function Sadbot() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    setLoading(true);
    api('/sadbot')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch sadbot status.');
        return response.json();
      })
      .then(data => {
        setStatus(data);
        setError('');
      })
      .catch(err => {
        setError(err.message);
        setStatus(null);
      })
      .finally(() => setLoading(false));
  };

  const handleRestart = () => {
    const options = {
      method: 'POST',
    };
    api('/sadbot/restart', options)
      .then(response => response.json())
      .then(successful => {
        if (successful) alert('Restart successful!');
      })
      .catch(err => {
        alert(`Failed to restart: ${err.message}`);
        fetchStatus();
      });
  };

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;
  if (error) return <div className="admin-container"><p className="error-text">Error: {error}</p></div>;

  return (
    <div className="admin-container">
      <div style={{width:"100%", height:"100%", boxSizing: "border-box", maxWidth: "1000px"}}>
        <div className={`status-row ${status.online ? 'status-row--on' : 'status-row--off'}`}>
          <div className="status-row-name">Sad Bot</div>
        </div>
        <button onClick={handleRestart} className="restart-sadbot">
          Restart Sad Bot
        </button>
      </div>
    </div>
  );
}