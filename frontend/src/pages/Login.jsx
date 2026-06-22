import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function Login() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        // Persist local fallback session for reliability
        localStorage.setItem('flavorsAndForkUser', JSON.stringify(response.data.user));
        
        navigate('/admin/menu');
      } else {
        throw new Error('Authentication succeeded but user data is missing.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setErrorMsg(err.response?.data?.error || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center text-white" style={{ minHeight: '75vh' }}>
      <div className="card bg-dark border border-secondary rounded-4 shadow-lg p-5" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <i className="bi bi-shield-lock-fill text-warning display-4 mb-2 d-inline-block"></i>
          <h2 className="fw-bold text-warning font-serif">Staff Access Portal</h2>
          <p className="text-white-50">Please log in to manage restaurant operations.</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger rounded-pill px-4 text-center fs-7 py-2 mb-3" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold text-white-50 fs-7">Email address</label>
            <input 
              type="email" 
              className="form-control bg-dark border-secondary text-white" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@flavorsandfork.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-white-50 fs-7">Password</label>
            <input 
              type="password" 
              className="form-control bg-dark border-secondary text-white" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-warning w-100 rounded-pill py-2 fw-bold text-dark d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
            style={{ transition: 'all 0.3s ease-in-out' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Log In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-white-50">
            Secure admin portal. Unauthorized attempts are logged.
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
