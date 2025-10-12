import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from "../util";

export default function Auth() {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: otp.trim() }),
    };

    api('/auth', options)
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message || 'Authentication failed') });
        }
        return response.json();
      })
      .then(data => {
        const oneYear = 365;
        Cookies.set('refreshToken', data.refreshToken, { expires: oneYear, secure: true, sameSite: 'strict' });
        alert('Login successful!');
        navigate('/admin');
        window.location.reload();
      })
      .catch(error => {
        console.error('Login error:', error);
        alert(`Error: ${error.message}`);
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Authentication Required</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter One-Time Password"
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f0f2f5',
    padding: '1rem',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.9rem 1.2rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.9rem 1.2rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};