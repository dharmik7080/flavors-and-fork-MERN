import React, { useState, useEffect } from 'react';
import { ReceiptPrinter } from './ReceiptPrinter';

export function BookingSuccessModal({ isOpen, onClose, reservationData }) {
  const [stage, setStage] = useState('processing');

  useEffect(() => {
    if (!isOpen) {
      setStage('processing');
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

  if (!isOpen || !reservationData) return null;

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
    gap: '8px',
    padding: '12px 0',
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

  return (
    <div style={backdropStyle}>
      <div style={containerStyle}>
        <h3 style={headerStyle}>Booking Confirmed</h3>
        
        <ReceiptPrinter stage={stage}>
          <ReceiptPrinter.Paper>
            <div style={brandingStyle}>
              <h4 style={brandNameStyle}>FLAVORS & FORK</h4>
              <p style={brandSubStyle}>Gourmet Dining Experience</p>
            </div>

            <div style={detailsListStyle}>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>GUEST NAME:</span>
                <span style={detailValueStyle}>{reservationData.name}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>DATE:</span>
                <span style={detailValueStyle}>{reservationData.date}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>TIME SLOT:</span>
                <span style={detailValueStyle}>{reservationData.timeSlot}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>TABLE ASSIGNED:</span>
                <span style={detailValueStyle}>Table #{reservationData.tableId}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>GUEST COUNT:</span>
                <span style={detailValueStyle}>{reservationData.guestCount} Guests</span>
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
