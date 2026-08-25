import React, { useState, useEffect } from 'react';
import { ReceiptPrinter } from './ReceiptPrinter';

export function ReceiptModal({ isOpen, onClose, mode, data }) {
  const [stage, setStage] = useState('processing');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds

  useEffect(() => {
    if (!isOpen) {
      setStage('processing');
      setTimeLeft(25 * 60);
      return;
    }

    setStage('processing');

    const printTimeout = setTimeout(() => {
      setStage('printing');
    }, 1000);

    const completeTimeout = setTimeout(() => {
      setStage('complete');
    }, 3200);

    return () => {
      clearTimeout(printTimeout);
      clearTimeout(completeTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || stage !== 'complete') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, stage]);

  if (!isOpen || !data) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Super high z-index to overlay everything
    padding: '16px',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    boxSizing: 'border-box'
  };

  const containerStyle = {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#0c0c0e',
    border: '1px solid #1c1c1e',
    borderRadius: '28px',
    padding: '24px',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffc107',
    textAlign: 'center',
    margin: 0,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'serif'
  };

  const brandingStyle = {
    textAlign: 'center',
    borderBottom: '1px dashed #d1d1d6',
    paddingBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  };

  const brandNameStyle = {
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '0.1em',
    margin: 0,
    fontFamily: 'sans-serif'
  };

  const brandSubStyle = {
    fontSize: '10px',
    color: '#8e8e93',
    margin: 0,
    fontFamily: 'sans-serif'
  };

  const detailsListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px 0',
    borderBottom: '1px dashed #d1d1d6'
  };

  const detailRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    lineHeight: '1.4'
  };

  const detailLabelStyle = {
    color: '#8e8e93'
  };

  const detailValueStyle = {
    fontWeight: '700',
    textAlign: 'right'
  };

  const footerTextStyle = {
    textAlign: 'center',
    paddingTop: '8px'
  };

  const doneButtonStyle = {
    width: '100%',
    marginTop: '16px',
    padding: '10px 16px',
    backgroundColor: '#1c1c1e',
    color: '#ffffff',
    fontWeight: '700',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box'
  };

  const itemsHeaderStyle = {
    fontWeight: '700',
    fontSize: '10px',
    color: '#8e8e93',
    borderBottom: '1px dashed #e5e5ea',
    paddingBottom: '4px',
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'space-between'
  };

  // Calculations for food order mode
  const getOrderFinancials = () => {
    const grandTotal = data.grandTotal || 0;
    const deliveryFee = data.serviceType === 'delivery' ? 40 : 0;
    const baseAmount = Math.max(0, grandTotal - deliveryFee);
    const subtotal = parseFloat((baseAmount / 1.05).toFixed(2));
    const gst = parseFloat((baseAmount - subtotal).toFixed(2));
    return { subtotal, gst, deliveryFee, grandTotal };
  };

  const financials = mode === 'order' ? getOrderFinancials() : null;

  // Determine screen details dynamically for printer terminal view
  const getScreenDetails = () => {
    if (stage === 'processing') {
      return {
        title: mode === 'reservation' ? 'Processing Booking...' : 'Processing Order...',
        subtitle: ''
      };
    }
    if (stage === 'printing') {
      return {
        title: 'Printing Receipt...',
        subtitle: ''
      };
    }
    
    // Complete State
    if (mode === 'reservation') {
      return {
        title: 'Reservation Confirmed',
        subtitle: `Table #${data.tableId} | Slot: ${data.timeSlot}`
      };
    } else {
      const orderRef = data._id || data.id || 'N/A';
      const shortRef = orderRef.length > 8 ? `...${orderRef.slice(-6)}` : orderRef;
      return {
        title: 'Order Placed',
        subtitle: `Ref: ${shortRef} | Prep: 25-30 mins`
      };
    }
  };

  const screenDetails = getScreenDetails();

  return (
    <div style={backdropStyle}>
      <div style={containerStyle}>
        <h3 style={headerStyle}>
          {mode === 'reservation' ? 'Booking Confirmed' : 'Order Placed'}
        </h3>
        
        <ReceiptPrinter 
          stage={stage} 
          screenTitle={screenDetails.title}
          screenSubtitle={screenDetails.subtitle}
        >
          <ReceiptPrinter.Paper>
            <div style={brandingStyle}>
              <h4 style={brandNameStyle}>FLAVORS & FORK</h4>
              <p style={brandSubStyle}>Gourmet Dining Experience</p>
            </div>

            {/* Mode: Reservation */}
            {mode === 'reservation' && (
              <>
                <div style={detailsListStyle}>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>GUEST NAME:</span>
                    <span style={detailValueStyle}>{data.name}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>DATE:</span>
                    <span style={detailValueStyle}>{data.date}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>TIME SLOT:</span>
                    <span style={detailValueStyle}>{data.timeSlot}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>TABLE ASSIGNED:</span>
                    <span style={detailValueStyle}>Table #{data.tableId}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>GUEST COUNT:</span>
                    <span style={detailValueStyle}>{data.guestCount} Guests</span>
                  </div>
                </div>

                <div style={footerTextStyle}>
                  <p style={{ fontSize: '10px', color: '#8e8e93', margin: 0, fontFamily: 'sans-serif' }}>
                    Thank you for booking with us!
                  </p>
                  <p style={{ fontSize: '9px', color: '#aeaeae', margin: '4px 0 0 0', fontFamily: 'sans-serif' }}>
                    Please present this receipt upon arrival.
                  </p>
                </div>
              </>
            )}

            {/* Mode: Order */}
            {mode === 'order' && (
              <>
                <div style={detailsListStyle}>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>ORDER REF:</span>
                    <span style={{ ...detailValueStyle, fontSize: '10px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {data._id || data.id || 'Pending'}
                    </span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>SERVICE:</span>
                    <span style={{ ...detailValueStyle, textTransform: 'uppercase' }}>
                      {data.serviceType}
                    </span>
                  </div>
                  {data.serviceType === 'dine-in' && (
                    <div style={detailRowStyle}>
                      <span style={detailLabelStyle}>TABLE NO:</span>
                      <span style={detailValueStyle}>
                        {String(data.tableNo).startsWith('Table') ? data.tableNo : `Table #${data.tableNo}`}
                      </span>
                    </div>
                  )}
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>PREP TIMER:</span>
                    <span style={{ ...detailValueStyle, color: '#d39e00', backgroundColor: '#fff3cd', padding: '1px 6px', borderRadius: '4px', fontSize: '9px' }}>
                      ⏳ {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Itemized list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '90px', overflowY: 'auto' }}>
                  <div style={itemsHeaderStyle}>
                    <span>DISH</span>
                    <span>QTY x PRICE</span>
                  </div>
                  {(data.items || []).map((item, idx) => (
                    <div key={idx} style={detailRowStyle}>
                      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span>
                        {item.qty || item.quantity || 1} x ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ ...detailsListStyle, borderTop: '1px dashed #d1d1d6', marginTop: '6px' }}>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>SUBTOTAL:</span>
                    <span>₹{financials.subtotal}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>GST (5%):</span>
                    <span>₹{financials.gst}</span>
                  </div>
                  {financials.deliveryFee > 0 && (
                    <div style={detailRowStyle}>
                      <span style={detailLabelStyle}>DELIVERY FEE:</span>
                      <span>₹{financials.deliveryFee}</span>
                    </div>
                  )}
                  <div style={{ ...detailRowStyle, fontSize: '12px', fontWeight: '800', borderTop: '1px solid #1c1c1e', paddingTop: '6px', marginTop: '2px' }}>
                    <span>TOTAL:</span>
                    <span style={{ color: '#ffc107' }}>₹{financials.grandTotal}</span>
                  </div>
                </div>
              </>
            )}

            {stage === 'complete' && (
              <button
                type="button"
                onClick={onClose}
                style={doneButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2c2c2e'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#1c1c1e'}
              >
                Done
              </button>
            )}
          </ReceiptPrinter.Paper>
        </ReceiptPrinter>
      </div>
    </div>
  );
}
