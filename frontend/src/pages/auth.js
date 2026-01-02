import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from "../util";
import './auth.css';

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
        Cookies.remove('accessToken', { secure: true, sameSite: 'strict' });
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