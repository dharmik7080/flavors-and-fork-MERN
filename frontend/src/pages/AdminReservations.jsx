import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const notificationAudio = useRef(new Audio('/notification.mp3'));
  const prevLength = useRef(null);

  // Fetch all reservations
  const fetchReservations = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const response = await axios.get('/api/reservations');
      // Sort reservations by date and time slot (latest or earliest first, let's keep chronologically sorted)
      const sorted = (response.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));

      // Check if reservations length has increased and play chime
      if (prevLength.current !== null && sorted.length > prevLength.current) {
        notificationAudio.current.play().catch(err => console.log("Autoplay prevented: awaits user interaction."));
      }
      prevLength.current = sorted.length;

      setReservations(sorted);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setErrorMsg('Failed to load live reservations queue.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with spinner
    fetchReservations(true);

    // Set up polling interval to check for new incoming reservations every 10 seconds
    const interval = setInterval(() => {
      fetchReservations(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle Mark Completed & Clear Table
  const handleClearTable = async (id, customerName, tableId) => {
    if (!window.confirm(`Are you sure you want to mark Table #${tableId}'s booking for "${customerName}" as completed and clear the table?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/reservations/${id}`);
      if (response.data.status === 'success') {
        // Update state locally instantly without full page refresh
        setReservations(prev => prev.filter(res => res._id !== id));
        setSuccessMsg(`Table #${tableId} successfully cleared and marked completed!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to clear reservation:', err);
      alert('Error clearing table: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handle Clear All Live Bookings
  const handleClearAll = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently clear all live table bookings? This action will cancel all active reservations.')) {
      return;
    }

    try {
      // Execute a destructive clear sequence via an array loop request structure
      await Promise.all(reservations.map(res => axios.delete(`/api/reservations/${res._id}`)));
      setReservations([]);
      setSuccessMsg('All live bookings successfully cleared!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to clear all reservations:', err);
      alert('Error clearing some or all tables: ' + (err.response?.data?.error || err.message));
      fetchReservations();
    }
  };

  return (
    <div className="container py-5 text-white" style={{ minHeight: '80vh' }}>
      {/* Header Area */}
      <div className="d-flex flex-column align-items-center justify-content-center text-center w-100 mb-4">
        <h1 className="fw-bold text-warning font-serif display-4 mb-0">Live Operational Queue</h1>
        <p className="text-white-50 mt-2 mb-0">Manage active dining table bookings and pre-ordered meals in real time.</p>
        {reservations.length > 0 && (
          <button 
            className="btn btn-outline-red-custom rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 mt-4 mb-4"
            onClick={handleClearAll}
          >
            <i className="bi bi-trash"></i> Clear All Live Bookings
          </button>
        )}
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-pill px-4 mb-4 border-success bg-dark text-success" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
          <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessMsg('')} aria-label="Close"></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show rounded-pill px-4 mb-4 border-danger bg-dark text-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMsg}
          <button type="button" className="btn-close btn-close-white" onClick={() => setErrorMsg('')} aria-label="Close"></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading reservation queue...</span>
          </div>
          <p className="mt-3 text-white-50">Fetching active booking sheets...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center text-white-50 py-5 bg-dark border border-secondary rounded-4 p-5">
          <i className="bi bi-clipboard-x fs-1 d-block mb-3 text-warning"></i>
          <h4 className="text-warning">No Active Bookings</h4>
          <p className="mb-0">The operational queue is currently empty. All tables are cleared!</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {reservations.map((booking) => {
            const hasPreOrder = booking.preOrderItems && booking.preOrderItems.length > 0;
            return (
              <div className="col" key={booking._id}>
                <div className="card h-100 bg-dark border border-secondary rounded-4 shadow-sm d-flex flex-column" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  {/* Card Header with Table ID */}
                  <div className="card-header border-secondary bg-black bg-opacity-30 d-flex justify-content-between align-items-center py-3 px-4">
                    <span className="fs-5 fw-bold text-warning font-serif">
                      <i className="bi bi-door-closed me-2"></i>Table #{booking.tableId}
                    </span>
                    <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold">
                      <i className="bi bi-people-fill me-1"></i>{booking.guestCount} Guests
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4 d-flex flex-column">
                    {/* Customer Info Section */}
                    <div className="mb-4">
                      <h6 className="text-warning text-uppercase tracking-wider small mb-3 border-bottom border-secondary pb-1 fw-bold">
                        Customer Info
                      </h6>
                      <p className="mb-1 text-white fw-semibold">
                        <i className="bi bi-person me-2 text-white-50"></i>{booking.name}
                      </p>
                      <p className="mb-1 text-white-50 small">
                        <i className="bi bi-telephone me-2"></i>{booking.phone}
                      </p>
                      <p className="mb-0 text-white-50 small text-truncate">
                        <i className="bi bi-envelope me-2"></i>{booking.email}
                      </p>
                    </div>

                    {/* Reservation Specs Section */}
                    <div className="mb-4">
                      <h6 className="text-warning text-uppercase tracking-wider small mb-3 border-bottom border-secondary pb-1 fw-bold">
                        Reservation Specs
                      </h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="bg-black bg-opacity-25 rounded-3 p-2 border border-secondary border-opacity-50 text-center">
                            <span className="d-block text-white-50 text-uppercase small" style={{ fontSize: '0.65rem' }}>Date</span>
                            <strong className="text-white small">{booking.date}</strong>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="bg-black bg-opacity-25 rounded-3 p-2 border border-secondary border-opacity-50 text-center">
                            <span className="d-block text-white-50 text-uppercase small" style={{ fontSize: '0.65rem' }}>Time Slot</span>
                            <strong className="text-white" style={{ fontSize: '0.75rem' }}>{booking.timeSlot}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pre-Order Module Section */}
                    <div className="mb-4 flex-grow-1">
                      <h6 className="text-warning text-uppercase tracking-wider small mb-3 border-bottom border-secondary pb-1 fw-bold">
                        Pre-Order Invoice
                      </h6>
                      {hasPreOrder ? (
                        <div className="bg-black bg-opacity-40 border border-secondary rounded-3 p-3">
                          <div className="table-responsive">
                            <table className="table table-sm table-dark table-borderless align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr className="text-white-50 border-bottom border-secondary border-opacity-50">
                                  <th scope="col" className="ps-0">Dish</th>
                                  <th scope="col" className="text-center">Qty</th>
                                  <th scope="col" className="text-end pe-0">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {booking.preOrderItems.map((item, idx) => (
                                  <tr key={item._id || idx}>
                                    <td className="ps-0 text-white fw-medium">{item.name}</td>
                                    <td className="text-center text-white-50">{item.quantity}</td>
                                    <td className="text-end text-warning pe-0">₹{item.price * item.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="border-top border-secondary border-opacity-50 mt-2 pt-2 d-flex justify-content-between align-items-center">
                            <span className="text-white fw-bold small text-uppercase">GRAND TOTAL:</span>
                            <span className="text-warning fw-bold fs-6">₹{booking.grandTotal || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white-50 fst-italic small mb-0 p-3 bg-black bg-opacity-25 rounded-3 border border-secondary border-opacity-20 text-center">
                          No pre-ordered food items compiled for this booking.
                        </p>
                      )}
                    </div>

                    {/* Clear Button */}
                    <button
                      className="btn btn-outline-success w-100 rounded-pill py-2 mt-auto fw-bold d-flex align-items-center justify-content-center gap-2 border-2"
                      style={{ transition: 'all 0.2s' }}
                      onClick={() => handleClearTable(booking._id, booking.name, booking.tableId)}
                    >
                      <i className="bi bi-check-circle-fill"></i> Mark as Completed & Clear Table
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminReservations;
