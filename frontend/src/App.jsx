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
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
