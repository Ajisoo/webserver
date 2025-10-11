import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Auth() {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const options = { // Define the fetch options
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp: otp }),
        };

        api('/auth', options) // Use your custom api function here
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || 'Authentication failed') });
                }
                return response.json();
            })
            .then(data => {
                // The API now only returns the refresh token.
                // We will save it in a long-lived cookie.
                const oneYear = 365; // The cookie will expire in 365 days.
                Cookies.set('refreshToken', data.refreshToken, { expires: oneYear, secure: true, sameSite: 'strict' });

                alert('Login successful!');
                navigate('/admin'); // Redirect to a protected page
            })
            .catch(error => {
                console.error('Login error:', error);
                alert(`Error: ${error.message}`);
            });
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Authentication Required</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="password"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter One-Time Password"
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Get Token</button>
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
        minHeight: 'calc(100vh - 60px)', // Adjust 60px if your navbar has a different height
        backgroundColor: '#f0f2f5', // Light background
        padding: '1rem',
        boxSizing: 'border-box', // Include padding in element's total width and height
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center', // Center text within the card
    },
    title: {
        fontSize: '1.8rem',
        color: '#333',
        marginBottom: '1.5rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem', // Space between input and button
    },
    input: {
        padding: '0.9rem 1.2rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out',
    },
    button: {
        padding: '0.9rem 1.2rem',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#007bff', // Primary blue color
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out',
    },
    buttonHover: { // Note: for actual hover, you'd use CSS or useState
        backgroundColor: '#0056b3',
    }
};