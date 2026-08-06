import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function FloorMap({ selectedTable, setSelectedTable, bookedTables, activeLocks = [], triggerToast, onInspect }) {
  const { user } = useContext(AuthContext);

  const handleTableClick = (tableNo) => {
    const tableId = String(tableNo);
    if (bookedTables.includes(tableId)) {
      return;
    }

    const currentUserId = user?._id || user?.id;
    const activeLock = activeLocks.find(l => Number(l.tableNo) === Number(tableNo));
    const isLockedByOther = activeLock && String(activeLock.lockedBy) !== String(currentUserId);

    if (isLockedByOther) {
      triggerToast('❌ This table is locked by another customer. Please select another table.');
      return;
    }

    setSelectedTable(tableId);
  };

  const renderTableCard = (tableNum, zone) => {
    const tableId = String(tableNum);
    const isBooked = bookedTables.includes(tableId);
    
    // Cast numbers and strings safely to prevent type-mismatch bugs
    const activeLock = activeLocks.find(l => Number(l.tableNo) === Number(tableNum));
    const currentUserId = user?._id || user?.id;
    
    const isLockedByOther = activeLock && String(activeLock.lockedBy) !== String(currentUserId);
    const isLockedByMe = Number(selectedTable) === Number(tableNum) || 
      (activeLock && String(activeLock.lockedBy) === String(currentUserId));

    let stateClass = 'available';
    if (isBooked) stateClass = 'booked';
    else if (isLockedByOther) stateClass = 'booked'; 
    else if (isLockedByMe) stateClass = 'selected';

    let zoneClass = '';
    if (zone === 'window') zoneClass = 'zone-window';
    else if (zone === 'lounge') zoneClass = 'zone-lounge';
    else if (zone === 'booth') zoneClass = 'zone-booth';

    // Build premium custom styles
    let cardStyle = {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    };

    if (isBooked) {
      cardStyle = {
        ...cardStyle,
        cursor: 'not-allowed',
        opacity: 0.6,
        backgroundColor: '#1c1c1c',
        border: '1px solid #333'
      };
    } else if (isLockedByOther) {
      cardStyle = {
        ...cardStyle,
        cursor: 'not-allowed',
        opacity: 0.5,
        backgroundColor: '#2a1a1a', // dark red/gray
        border: '1px solid #721c24', // dark red border
        boxShadow: 'inset 0 0 10px rgba(114, 28, 36, 0.3)'
      };
    } else if (isLockedByMe) {
      cardStyle = {
        ...cardStyle,
        backgroundColor: '#2b2310', // dark yellow background
        border: '2px solid #ffc107', // yellow glow border
        boxShadow: '0 0 12px rgba(255, 193, 7, 0.4), inset 0 0 8px rgba(255, 193, 7, 0.2)'
      };
    }

    return (
      <div
        key={tableId}
        onClick={() => !isBooked && !isLockedByOther && handleTableClick(tableId)}
        className={`table-card ${stateClass} ${zoneClass} position-relative`}
        style={cardStyle}
      >
        Table #{tableId}
        {isBooked && (
          <div className="small fw-normal mt-1" style={{ fontSize: '0.8rem' }}>Booked</div>
        )}
        {isLockedByOther && !isBooked && (
          <div className="small fw-normal mt-1 text-danger" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
            🔒 Locked
          </div>
        )}
        {isLockedByMe && (
          <div className="small fw-normal mt-1 text-warning" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
            🟢 Reserved
          </div>
        )}
        {isLockedByMe && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(tableId);
            }}
            className="btn btn-sm position-absolute"
            style={{
              top: '4px',
              right: '4px',
              padding: '0 3px',
              background: 'transparent',
              border: 'none',
              color: '#fcc203',
              lineHeight: 1,
              zIndex: 10
            }}
            title="Inspect Table Details"
          >
            <i className="bi bi-info-circle-fill" style={{ fontSize: '0.85rem' }}></i>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="seating-layout-container d-flex flex-column gap-3">


      {/* Window Views Section */}
      <div className="seating-section">
        <h5 className="text-white-50 mb-3 fs-6 font-serif d-flex align-items-center gap-2" style={{ letterSpacing: '1px', opacity: 0.8 }}>
          <i className="bi bi-window-sidebar text-warning"></i> WINDOW VIEWS (PREMIUM)
        </h5>
        <div className="seating-grid-row gap-4">
          {[1, 2, 3, 4].map((num) => renderTableCard(num, 'window'))}
        </div>
      </div>

      {/* Main Lounge Section */}
      <div className="seating-section">
        <h5 className="text-white-50 mb-3 fs-6 font-serif d-flex align-items-center gap-2" style={{ letterSpacing: '1px', opacity: 0.8 }}>
          <i className="bi bi-house-door text-warning"></i> MAIN DINING LOUNGE
        </h5>
        <div className="seating-grid-row gap-4">
          {[5, 6, 7, 8].map((num) => renderTableCard(num, 'lounge'))}
        </div>
      </div>

      {/* Private Booths Section */}
      <div className="seating-section">
        <h5 className="text-white-50 mb-3 fs-6 font-serif d-flex align-items-center gap-2" style={{ letterSpacing: '1px', opacity: 0.8 }}>
          <i className="bi bi-bookmark-star text-warning"></i> PRIVATE BOOTHS
        </h5>
        <div className="booth-grid-row gap-4">
          {[9, 10].map((num) => renderTableCard(num, 'booth'))}
        </div>
      </div>
    </div>
  );
}

export default FloorMap;
