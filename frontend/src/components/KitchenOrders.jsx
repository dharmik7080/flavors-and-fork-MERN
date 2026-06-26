import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function KitchenOrderCard({ order, handleStatusUpdate, handlePrintKOT, getStatusBadgeClass }) {
  const [elapsedTime, setElapsedTime] = useState("");
  useEffect(() => {
    const calculateElapsed = () => {
      const diffMs = new Date() - new Date(order.createdAt);
      const diffMins = Math.floor(diffMs / 1000 / 60);
      setElapsedTime(diffMins <= 0 ? "Just now" : `${diffMins} mins ago`);
    };
    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [order.createdAt]);

  return (
    <div className="col">
      <div className="card h-100 bg-dark border border-secondary rounded-4 shadow-sm d-flex flex-column" style={{ transition: 'all 0.2s' }}>
        
        {/* Header: Order ID & Elapsed Time & Status Badge */}
        <div className="card-header border-secondary bg-black bg-opacity-30 d-flex justify-content-between align-items-center py-3 px-4">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fs-6 fw-bold text-warning font-serif">
              <i className="bi bi-receipt me-2"></i>Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 font-medium" style={{ fontSize: '0.75rem', backgroundColor: '#27272a', color: '#a1a1aa' }}>🕒 {elapsedTime}</span>
          </div>
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
              {order.serviceType === 'delivery' ? (
                <span>📍 Delivery: <strong className="text-warning">{order.deliveryAddress}</strong></span>
              ) : (
                <span>🪑 Seating: <strong className="text-warning">{order.tableNo}</strong></span>
              )}
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
              className="btn btn-outline-warning rounded-pill px-3 py-2 fw-bold d-flex align-items-center justify-content-center border-2"
              onClick={() => handlePrintKOT(order)}
              title="Print KOT"
            >
              🖨️ Print
            </button>
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
  );
}

function KitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);

  const prevLength = useRef(null);

  // Fetch active incoming orders
  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const response = await axios.get('/api/orders');
      const data = response.data || [];

      // Check if data length has increased and play chime with debug logs
      const incomingLength = data.length;
      console.log("--- Kitchen Orders Audio Notification Debug ---");
      console.log("Previous Length Ref:", prevLength.current);
      console.log("Incoming Data Length:", incomingLength);

      if (prevLength.current !== null && incomingLength > prevLength.current) {
        console.log("🚀 Condition MET! Ringing service bell chime...");

        // Grab the newest order ID
        const newestOrder = data[incomingLength - 1];
        // Target our customized display orderId string property (matching the client's format)
        const targetOrderId = newestOrder?.orderId || (newestOrder?._id ? `ORD-${newestOrder._id.slice(-4).toUpperCase()}` : "New Order");

        // Trigger visual notification
        setActiveNotification(targetOrderId);
        setTimeout(() => {
          setActiveNotification(null);
        }, 5000);

        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioContext();

          // Automatically wake up the audio context if Chrome suspended it
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          // Create primary sharp strike and a secondary resonant overtone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          // High-pitched crystal bell frequencies (Tuned to high G and C notes)
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1567.98, ctx.currentTime); // High G6 strike
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(2093.00, ctx.currentTime); // High C7 resonance ring

          // Bell volume envelope: Instant sharp strike, long beautiful decay tail
          gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2); // Fades out over 1.2 seconds

          // Connect everything to your MacBook speakers
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);

          // Start both wave frequencies together
          osc1.start();
          osc2.start();
          
          // Stop playing after the decay ends
          osc1.stop(ctx.currentTime + 1.2);
          osc2.stop(ctx.currentTime + 1.2);

          console.log("🔊 Bell chime rang successfully!");
        } catch (err) {
          console.error("❌ Audio synthesis failed:", err);
        }
      } else {
        console.log("🛑 Condition NOT met.");
      }
      prevLength.current = incomingLength;

      setOrders(data);
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

  const handlePrintKOT = (orderItem) => {
    const printWindow = window.open("", "_blank");
    const displayOrderId = orderItem.orderId || (orderItem._id ? `ORD-${orderItem._id.slice(-4).toUpperCase()}` : "New Order");
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - #${displayOrderId}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .items { margin: 15px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>FLAVORS & FORK - KOT</h3>
            <p>Order: #${displayOrderId}</p>
            <p>Type: ${orderItem.serviceType?.toUpperCase()} | ${orderItem.serviceType === 'dine-in' ? orderItem.tableNo : 'Delivery'}</p>
            <p>Time: ${new Date(orderItem.createdAt).toLocaleTimeString()}</p>
          </div>
          <div class="items">
            ${orderItem.items.map(item => `
              <div class="item-row">
                <span>${item.name} x${item.quantity || item.qty || 1}</span>
              </div>
            `).join('')}
          </div>
          <div class="header" style="border-top: 1px dashed #000; padding-top: 10px;">
            <p>** START PREPARING **</p>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="container py-5 text-white" style={{ minHeight: '80vh' }}>
      {activeNotification && (
        <div 
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#18181b', // Zinc 900
            border: '1px solid #10b981', // Emerald 500
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Clean indicator icon matching customer notification rhythm */}
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#34d399',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ✓
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              Order #{activeNotification} placed!
            </span>
          </div>
        </div>
      )}
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
            <KitchenOrderCard 
              key={order._id}
              order={order}
              handleStatusUpdate={handleStatusUpdate}
              handlePrintKOT={handlePrintKOT}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenOrders;
