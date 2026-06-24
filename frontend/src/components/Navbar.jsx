import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

function Navbar({ isDarkMode, toggleTheme }) {
  const { totalItemsCount, setShowCartDrawer } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user && (user.isAdmin === true || user.role === 'admin');
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shop Status logic (Open 11:00 AM - 11:00 PM)
  const [isOpenNow, setIsOpenNow] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const hour = new Date().getHours();
      setIsOpenNow(hour >= 11 && hour < 23);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark navbar-sticky ${isScrolled ? 'scrolled-navbar' : 'top-navbar'}`}>
      <div className="container">
        <Link className="navbar-brand font-serif" to="/">Flavors & Fork</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`} to="/menu">Menu</Link>
            </li>
            {!isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/reservation' ? 'active' : ''}`} to="/reservation">Reservation</Link>
              </li>
            )}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`} to="/analytics">Analytics</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/admin/menu' ? 'active' : ''}`} to="/admin/menu">Admin Menu</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/admin/reservations' ? 'active' : ''}`} to="/admin/reservations">Reservations</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/admin/orders' ? 'active' : ''}`} to="/admin/orders">Kitchen Orders</Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item d-flex align-items-center">
              {location.pathname === '/menu' ? (
                <button 
                  onClick={() => setShowCartDrawer(true)}
                  className="btn nav-link position-relative text-white border-0 bg-transparent" 
                  aria-label="Cart"
                >
                  <i className="bi bi-cart fs-5"></i>
                  <span 
                    id="cartBadge"
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                    style={{ display: totalItemsCount > 0 ? 'block' : 'none' }}
                  >
                    {totalItemsCount}
                  </span>
                </button>
              ) : (
                <Link 
                  to="/menu"
                  className="nav-link position-relative text-white" 
                  aria-label="Cart"
                >
                  <i className="bi bi-cart fs-5"></i>
                  <span 
                    id="cartBadge"
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                    style={{ display: totalItemsCount > 0 ? 'block' : 'none' }}
                  >
                    {totalItemsCount}
                  </span>
                </Link>
              )}
            </li>
            {user && (
              <li className="nav-item d-flex align-items-center ms-3">
                <button 
                  onClick={logout} 
                  className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                >
                  Logout
                </button>
              </li>
            )}
            <li className="nav-item d-flex align-items-center ms-3">
              <span 
                id="status-badge" 
                className={`badge rounded-pill me-3 shadow-sm ${isOpenNow ? 'bg-success' : 'bg-danger'}`}
                style={{ fontSize: '0.8rem', transition: 'all 0.3s' }}
              >
                {isOpenNow ? '🟢 OPEN NOW' : '🔴 CLOSED'}
              </span>
              <div className="form-check form-switch mb-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="theme-toggle"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <label className="form-check-label text-white" htmlFor="theme-toggle">Dark Mode</label>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
