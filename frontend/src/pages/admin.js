import React, {useState, useEffect} from 'react';
import api from "../util";

export default function Admin() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the initial status when the component loads
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    // setLoading(true);
    // api('/admin')
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch admin status.');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         setStatus(data);
    //         setError('');
    //     })
    //     .catch(err => {
    //         setError(err.message);
    //         setStatus(null);
    //     })
    //     .finally(() => {
    //         setLoading(false);
    //     });
    setStatus({
      'sadBotOnline': true,
      'lights': [{'name': 'Living Room', 'on': true}, {'name': 'Bedroom', 'on': false}]
    });
    setLoading(false);
  };

  const handleToggleLight = (name, currentState) => {
    const options = {
      method: 'POST',
      body: JSON.stringify({name: name, setOn: !currentState}),
    };

    api('/admin/light', options)
      .then(response => response.json())
      .then(updatedLight => {
        // Update the state with the new light status from the server's response
        setStatus(prevStatus => ({
          ...prevStatus,
          lights: prevStatus.lights.map(light =>
            light.name === name ? updatedLight : light
          ),
        }));
      })
      .catch(err => {
        alert(`Failed to toggle light: ${err.message}`);
        // Optionally, refetch all statuses to ensure UI is in sync
        fetchStatus();
      });
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;
  if (error) return <div style={styles.container}><p style={{color: 'red'}}>Error: {error}</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin Panel</h1>

        <div style={styles.statusSection}>
          <span>Sad Bot Status:</span>
          <span style={status.sadBotOnline ? styles.online : styles.offline}>
                        {status.sadBotOnline ? 'Online' : 'Offline'}
                    </span>
        </div>

        <h2 style={styles.subtitle}>Light Controls</h2>
        <div style={styles.lightList}>
          {status.lights.map(light => (
            <div key={light.name} style={styles.lightItem}>
              <span style={styles.lightName}>{light.name}</span>
              <div style={styles.lightStatusContainer}>
                                <span style={light.on ? styles.online : styles.offline}>
                                    {light.on ? 'ON' : 'OFF'}
                                </span>
                <button
                  onClick={() => handleToggleLight(light.name, light.on)}
                  style={styles.button}
                >
                  Toggle
                </button>
              </div>
              {light.error && <small style={styles.errorText}>Error: {light.error}</small>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // Align to top for longer content
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f0f2f5',
    padding: '2rem',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    textAlign: 'center',
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '1rem',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '1.3rem',
    color: '#555',
    marginTop: '2rem',
    marginBottom: '1rem',
    borderTop: '1px solid #eee',
    paddingTop: '1.5rem',
  },
  statusSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.1rem',
    padding: '1rem',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  online: {
    color: '#28a745', // Green
    fontWeight: 'bold',
  },
  offline: {
    color: '#dc3545', // Red
    fontWeight: 'bold',
  },
  lightList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  lightItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    border: '1px solid #eee',
    borderRadius: '8px',
  },
  lightName: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  lightStatusContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  },
  errorText: {
    color: '#dc3545',
    marginTop: '0.5rem',
  }
};