import React, { useState, useEffect } from 'react';
import axios from 'axios';

function KitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch active incoming orders
  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data || []);
      setErrorMsg('');
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setErrorMsg('Failed to fetch active kitchen orders queue.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load with spinner
    fetchOrders(true);

    // Set up polling interval to check for new incoming checkouts every 10 seconds
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Update order status lifecycle
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await axios.patch(`/api/orders/${id}/status`, { status: newStatus });
      if (response.data) {
        // If served or cancelled, archive/remove from active display instantly
        if (newStatus === 'Served' || newStatus === 'Cancelled') {
          setOrders(prev => prev.filter(order => order._id !== id));
          setSuccessMsg(`Order successfully marked as ${newStatus}!`);
        } else {
          // Otherwise update its status badge state locally
          setOrders(prev => prev.map(order => order._id === id ? { ...order, status: newStatus } : order));
          setSuccessMsg(`Order status updated to ${newStatus}.`);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Error updating order: ' + (err.response?.data?.error || err.message));
    }
  };

  // Helper to determine status badge style class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-danger text-white';
      case 'Preparing': return 'bg-warning text-dark';
      case 'Served': return 'bg-success text-white';
      case 'Cancelled': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  };

  return (
    <div className="container py-5 text-white" style={{ minHeight: '80vh' }}>
      {/* Header section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-warning font-serif display-4 mb-2">Kitchen Orders Queue</h1>
        <p className="text-white-50">Manage incoming food orders and track their preparation status in real time.</p>
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
            <span className="visually-hidden">Loading kitchen queue...</span>
          </div>
          <p className="mt-3 text-white-50">Loading incoming food tickets...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-white-50 py-5 bg-dark border border-secondary rounded-4 p-5">
          <i className="bi bi-egg-fried fs-1 d-block mb-3 text-warning"></i>
          <h4 className="text-warning font-serif">All Clear!</h4>
          <p className="mb-0">No active incoming orders to prepare right now.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {orders.map((order) => (
            <div className="col" key={order._id}>
              <div className="card h-100 bg-dark border border-secondary rounded-4 shadow-sm d-flex flex-column" style={{ transition: 'all 0.2s' }}>
                
                {/* Header: Order ID & Status Badge */}
                <div className="card-header border-secondary bg-black bg-opacity-30 d-flex justify-content-between align-items-center py-3 px-4">
                  <span className="fs-6 fw-bold text-warning font-serif">
                    <i className="bi bi-receipt me-2"></i>Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`badge px-3 py-1 rounded-pill fw-bold ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Body: Items & Details */}
                <div className="card-body p-4 d-flex flex-column">
                  
                  {/* Customer / Order Specs */}
                  <div className="mb-3 border-bottom border-secondary pb-3">
                    <p className="mb-1 text-white-50 small">
                      <i className="bi bi-person me-2"></i>{order.email}
                    </p>
                    <p className="mb-1 text-white-50 small">
                      <i className="bi bi-clock me-2"></i>
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mb-0 text-white-50 small">
                      <i className="bi bi-door-closed me-2"></i>Table No: <strong className="text-white">{order.tableNo || 'N/A'}</strong>
                    </p>
                  </div>

                  {/* Items Ordered List */}
                  <div className="mb-4 flex-grow-1">
                    <h6 className="text-warning text-uppercase tracking-wider small mb-3 fw-bold">Dishes to Prepare</h6>
                    <div className="bg-black bg-opacity-40 border border-secondary rounded-3 p-3">
                      <table className="table table-sm table-dark table-borderless align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                        <thead>
                          <tr className="text-white-50 border-bottom border-secondary border-opacity-50" style={{ fontSize: '0.8rem' }}>
                            <th scope="col" className="ps-0">Dish Name</th>
                            <th scope="col" className="text-end pe-0">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="border-bottom border-secondary border-opacity-10">
                              <td className="ps-0 text-white fw-medium">{item.name}</td>
                              <td className="text-end text-warning fw-bold pe-0">x{item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-top border-secondary border-opacity-30 mt-3 pt-2 d-flex justify-content-between align-items-center">
                        <span className="text-white-50 small font-uppercase">Invoice Total:</span>
                        <span className="text-warning fw-bold">₹{order.grandTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="mt-auto d-flex gap-2">
                    {order.status === 'Pending' && (
                      <button
                        className="btn btn-warning flex-grow-1 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1 border-0"
                        onClick={() => handleStatusUpdate(order._id, 'Preparing')}
                      >
                        <i className="bi bi-play-fill fs-5"></i> Start Preparing
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        className="btn btn-success flex-grow-1 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1 border-0"
                        onClick={() => handleStatusUpdate(order._id, 'Served')}
                      >
                        <i className="bi bi-check-circle-fill"></i> Mark Served
                      </button>
                    )}
                    <button
                      className="btn btn-outline-danger rounded-pill px-3 py-2 fw-bold d-flex align-items-center justify-content-center border-2"
                      onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                      title="Cancel Order"
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenOrders;
