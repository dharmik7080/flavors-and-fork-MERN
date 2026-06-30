import React, { useState } from 'react';
import axios from 'axios';

function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email.trim())) {
      setMsg({ text: '❌ Invalid email format', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const response = await axios.post('/api/newsletter/subscribe', {
        email: email.trim()
      });

      alert("Thank you for joining our community!");
      setMsg({ text: '✅ Subscribed!', type: 'success' });
      setEmail(''); // Clear input
    } catch (err) {
      console.error('Newsletter subscription failed:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Subscription failed. Please try again.';
      setMsg({ text: `❌ ${errMsg}`, type: 'error' });
      alert(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMsg({ text: '', type: '' });
      }, 5000);
    }
  };

  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-4 col-md-6 mb-4 mb-md-0 mx-auto text-center">
            <h5 className="text-uppercase fw-bold text-warning mb-3">
              <i className="bi bi-envelope-paper-fill me-2"></i>Join Our Community
            </h5>
            <p className="text-white-50 small mb-4">
              Get exclusive offers, secret menu updates, and 10% off your first dine-in!
            </p>

            <form id="newsletter-form" onSubmit={handleSubscribe}>
              <div className="input-group mb-3 shadow-sm">
                <input 
                  type="email" 
                  id="newsletter-email"
                  className="form-control newsletter-input"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <button 
                  className="btn btn-warning newsletter-btn fw-bold px-4" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {msg.text && (
                <small 
                  id="newsletter-msg" 
                  className={`fw-bold d-block mt-2 ${msg.type === 'success' ? 'text-success' : 'text-danger'}`}
                >
                  {msg.text}
                </small>
              )}
            </form>
          </div>
        </div>
        <div className="text-center p-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="mb-0">&copy; {new Date().getFullYear()} Flavors & Fork. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
