import React, { useState, useEffect } from 'react';
import api from "../util";
import './admin.css';

export default function Admin() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    setLoading(true);
    api('/admin')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch admin status.');
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

  const handleToggleLight = (name, currentState) => {
    const options = {
      method: 'POST',
      body: JSON.stringify({ name: name, setOn: !currentState }),
    };
    api('/admin/light', options)
      .then(response => response.json())
      .then(updatedLight => {
        setStatus(prevStatus => ({
          ...prevStatus,
          lights: prevStatus.lights.map(light =>
            light.name === name ? updatedLight : light
          ),
        }));
      })
      .catch(err => {
        alert(`Failed to toggle light: ${err.message}`);
        fetchStatus();
      });
  };

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;
  if (error) return <div className="admin-container"><p className="error-text">Error: {error}</p></div>;

  return (
    <div className="admin-container">
      <div className={`status-row ${status.sadBotOnline ? 'status-row--on' : 'status-row--off'}`}>
        <span className="status-row-name">Sad Bot</span>
      </div>
      <div className="status-grid">
        {status.lights.map(light => (
          light.error ? (
            // Render this block if the light has an error
            <div key={light.name} className="status-card status-card--error">
              <span className="status-card-name">{light.name}</span>
              <span className="status-card-error-message">{light.error}</span>
            </div>
          ) : (
            // Render this block if there is no error
            <div
              key={light.name}
              className={`status-card toggleable ${light.on ? 'status-card--on' : 'status-card--off'}`}
              onClick={() => handleToggleLight(light.name, light.on)}
            >
              <span className="status-card-name">{light.name}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}