import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Reservation from './pages/Reservation.jsx';
import Analytics from './pages/Analytics.jsx';
import AdminMenu from './pages/AdminMenu.jsx';
import AdminReservations from './pages/AdminReservations.jsx';
import KitchenOrders from './components/KitchenOrders.jsx';
import Login from './pages/Login.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AdminProtectedRoute } from './components/ProtectedRoute.jsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // default to dark mode per design guidelines
  const [toastMsg, setToastMsg] = useState('');

  // Initialize theme from LocalStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme !== 'light'; // dark by default
    setIsDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Theme Toggle Handler
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Toast Trigger Helper
  const triggerToast = (msg) => {
    setToastMsg(msg);
    // Haptic feedback trigger for supported Android devices
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (err) {}
    }
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate current scroll depth metrics
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate percentage integer (0 to 100)
      const totalScroll = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollPercentage(totalScroll);

      // Handle visibility toggle
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar 
              isDarkMode={isDarkMode} 
              toggleTheme={toggleTheme}
            />

            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/menu" 
                  element={<Menu triggerToast={triggerToast} />} 
                />
                <Route path="/reservation" element={<Reservation triggerToast={triggerToast} />} />
                <Route path="/admin-login" element={<Login />} />
                <Route 
                  path="/analytics" 
                  element={
                    <AdminProtectedRoute>
                      <Analytics triggerToast={triggerToast} />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/menu" 
                  element={
                    <AdminProtectedRoute>
                      <AdminMenu />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/reservations" 
                  element={
                    <AdminProtectedRoute>
                      <AdminReservations />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <AdminProtectedRoute>
                      <KitchenOrders />
                    </AdminProtectedRoute>
                  } 
                />
              </Routes>
            </main>

            <Footer />

            {/* Transient Toast Notification (HTML Ported) */}
            {toastMsg && (
              <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 5000 }}>
                <div className="toast show align-items-center text-white bg-dark border-warning" role="alert" aria-live="assertive" aria-atomic="true">
                  <div className="d-flex">
                    <div className="toast-body">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>{toastMsg}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close btn-close-white me-2 m-auto" 
                      onClick={() => setToastMsg('')}
                    ></button>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to Top Floating Button */}
            {isVisible && (
              <button
                onClick={scrollToTop}
                style={{
                  position: 'fixed',
                  bottom: '24px',
                  right: '24px',
                  zIndex: 50,
                  backgroundColor: '#0a0a0a', // Dark interior canvas background so the ring pops out crisp
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0
                }}
                className="hover:scale-110 active:scale-95 transition-transform duration-200"
              >
                <svg width="46" height="46" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track Circle */}
                  <circle
                    cx="23"
                    cy="23"
                    r="18"
                    stroke="#27272a"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  {/* Dynamic Brand Golden Progress Circle */}
                  <circle
                    cx="23"
                    cy="23"
                    r="18"
                    stroke="#fcc203"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * scrollPercentage) / 100}
                    // Zero transition styling allows raw, immediate hardware-accelerated repaints
                  />
                </svg>
                {/* Arrow Overlay positioned perfectly inside */}
                <span style={{
                  position: 'absolute',
                  color: '#fcc203',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}>↑</span>
              </button>
            )}
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
