import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

function Navbar({ isDarkMode, toggleTheme }) {
  const { totalItemsCount, setShowCartDrawer } = useContext(CartContext);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user && (user.isAdmin === true || user.role === 'admin');
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/analytics';

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

  const handleLogout = async () => {
    try {
      // 1. Clear backend session if applicable
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error("Client-side logout api error:", error);
    } finally {
      // 2. Erase global frontend user state
      setUser(null);
      localStorage.removeItem('flavorsAndForkUser');
      // 3. Bounce back to public landing page
      navigate('/');
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark navbar-sticky ${isScrolled ? 'scrolled-navbar' : 'top-navbar'}`}>
      <div className="container navbar-inner-wrapper">
        <Link className="navbar-brand logo-pacifico" to="/">Flavors & Fork</Link>
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
            {isAdmin && isAdminPage ? (
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
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${location.pathname === '/menu' ? 'active' : ''}`} to="/menu">Menu</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${location.pathname === '/reservation' ? 'active' : ''}`} to="/reservation">Reservation</Link>
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
            {user && isAdminPage && (
              <li className="nav-item d-flex align-items-center ms-3">
                <button 
                  onClick={handleLogout} 
                  className="btn border border-danger text-danger rounded-pill px-3 py-1 bg-transparent"
                  style={{ fontSize: '0.9rem', fontWeight: '600' }}
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
