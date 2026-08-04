import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function AuthPortal() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && (user._id || user.id || user.email)) {
      navigate(user.isAdmin || user.role === 'admin' ? '/admin/menu' : '/');
    }
  }, [user, navigate]);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handlePostAuthRedirect = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem('flavorsAndForkUser', JSON.stringify(loggedUser));

    const queryParams = new URLSearchParams(window.location.search);
    const urlRedirect = queryParams.get('redirect');
    const pendingAction = sessionStorage.getItem('pendingAction');

    if (pendingAction) {
      try {
        const parsedAction = JSON.parse(pendingAction);
        if (parsedAction.pathname) {
          navigate(parsedAction.pathname);
          return;
        }
      } catch (e) {
        console.error('Failed to parse pendingAction:', e);
      }
    }

    if (urlRedirect) {
      navigate(urlRedirect);
    } else {
      navigate(loggedUser.isAdmin || loggedUser.role === 'admin' ? '/admin/menu' : '/');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      if (response.data && response.data.user) {
        handlePostAuthRedirect(response.data.user);
      } else {
        throw new Error('Authentication succeeded but user payload is missing.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.error || 'Invalid credentials or network failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regSurname || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all the registration fields.');
      return;
    }

    try {
      setLoading(true);
      const regRes = await axios.post('/api/auth/register', {
        name: regName,
        surname: regSurname,
        email: regEmail,
        password: regPassword
      });

      if (regRes.data.status === 'success') {
        setSuccessMsg('Account created successfully! Logging you in...');
        
        // Auto-login immediately following registration
        const logRes = await axios.post('/api/auth/login', {
          email: regEmail,
          password: regPassword
        });

        if (logRes.data && logRes.data.user) {
          setTimeout(() => {
            handlePostAuthRedirect(logRes.data.user);
          }, 1000);
        } else {
          setIsLoginTab(true);
          setSuccessMsg('Registration complete. Please sign in below.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      const serverErr = err.response?.data?.errors;
      setErrorMsg(Array.isArray(serverErr) ? serverErr.join(' | ') : (err.response?.data?.error || 'Failed to create account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center text-white my-5" style={{ minHeight: '70vh' }}>
      <div className="card bg-dark border border-secondary rounded-4 shadow-lg p-4 p-md-5" style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Tab Controls */}
        <div className="d-flex border-bottom border-secondary mb-4">
          <button 
            type="button"
            className={`btn flex-grow-1 py-2 fw-bold text-uppercase border-0 rounded-0 bg-transparent ${isLoginTab ? 'text-warning border-bottom border-warning border-2' : 'text-white-50'}`}
            style={{ transition: 'all 0.3s' }}
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`btn flex-grow-1 py-2 fw-bold text-uppercase border-0 rounded-0 bg-transparent ${!isLoginTab ? 'text-warning border-bottom border-warning border-2' : 'text-white-50'}`}
            style={{ transition: 'all 0.3s' }}
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center mb-4">
          <h2 className="fw-bold text-warning font-serif">
            {isLoginTab ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white-50 small">
            {isLoginTab ? 'Sign in to access bookings, pre-orders, and custom discounts.' : 'Join Flavors & Fork to reserve tables and place pre-orders.'}
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger rounded-4 px-4 text-center fs-7 py-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success rounded-4 px-4 text-center fs-7 py-2 mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          </div>
        )}

        {isLoginTab ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold text-white-50 fs-7">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-dark border-secondary text-white" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-white-50 fs-7">Password</label>
              <input 
                type="password" 
                className="form-control bg-dark border-secondary text-white" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-warning w-100 rounded-pill py-2.5 fw-bold text-dark d-flex align-items-center justify-content-center gap-2"
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
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="row g-2 mb-3">
              <div className="col">
                <label className="form-label fw-bold text-white-50 fs-7">First Name</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="col">
                <label className="form-label fw-bold text-white-50 fs-7">Last Name</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white" 
                  value={regSurname}
                  onChange={(e) => setRegSurname(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-white-50 fs-7">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-dark border-secondary text-white" 
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="john.doe@example.com"
                required
              />
            </div>



            <div className="mb-4">
              <label className="form-label fw-bold text-white-50 fs-7">Password</label>
              <input 
                type="password" 
                className="form-control bg-dark border-secondary text-white" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create Password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-warning w-100 rounded-pill py-2.5 fw-bold text-dark d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ transition: 'all 0.3s ease-in-out' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i> Create Account
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default AuthPortal;
