import React, { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubscribe = (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email.trim())) {
      setMsg({ text: '❌ Invalid email format', type: 'error' });
    } else {
      setMsg({ text: '✅ Subscribed!', type: 'success' });
      setEmail(''); // Clear input
    }

    setTimeout(() => {
      setMsg({ text: '', type: '' });
    }, 3000);
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
                  className="form-control rounded-pill rounded-end-0 border-0 py-2 ps-4"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
                <button className="btn btn-warning rounded-pill rounded-start-0 fw-bold px-4" type="submit">
                  Subscribe
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
