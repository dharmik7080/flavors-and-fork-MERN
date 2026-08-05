import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function FloorMap({ selectedTable, setSelectedTable, bookedTables, activeLocks = [], triggerToast, onInspect }) {
  const { user } = useContext(AuthContext);

  const handleTableClick = (tableId) => {
    if (bookedTables.includes(tableId)) {
      return;
    }

    // Normalize to string to avoid ObjectId vs string comparison bugs
    const currentUserId = user ? String(user._id || user.id || '') : '';
    const currentLock = activeLocks.find(lock => lock.tableNo === tableId);
    const isLockedByOther = currentLock && currentUserId &&
      String(currentLock.lockedBy) !== currentUserId;

    if (isLockedByOther) {
      triggerToast('❌ This table is locked by another customer. Please select another table.');
      return;
    }

    setSelectedTable(tableId);
  };

  const renderTableCard = (tableNum, zone) => {
    const tableId = String(tableNum);
    const isBooked = bookedTables.includes(tableId);
    
    // Normalize to string to avoid ObjectId vs string comparison bugs
    const currentUserId = user ? String(user._id || user.id || '') : '';
    const currentLock = activeLocks.find(lock => lock.tableNo === tableId);
    
    const isLockedByMe = selectedTable === tableId || 
      (currentLock && currentUserId && String(currentLock.lockedBy) === currentUserId);
    const isLockedByOther = currentLock && currentUserId && 
      String(currentLock.lockedBy) !== currentUserId;

    let stateClass = 'available';
    if (isBooked) stateClass = 'booked';
    else if (isLockedByOther) stateClass = 'booked'; // Render other locks as booked/disabled style
    else if (isLockedByMe) stateClass = 'selected';

    let zoneClass = '';
    if (zone === 'window') zoneClass = 'zone-window';
    else if (zone === 'lounge') zoneClass = 'zone-lounge';
    else if (zone === 'booth') zoneClass = 'zone-booth';

    return (
      <div
        key={tableId}
        onClick={() => handleTableClick(tableId)}
        className={`table-card ${stateClass} ${zoneClass} position-relative`}
        style={{
          cursor: isBooked || isLockedByOther ? 'not-allowed' : 'pointer',
          opacity: isLockedByOther ? 0.6 : 1
        }}
      >
        Table #{tableId}
        {isBooked && (
          <div className="small fw-normal mt-1" style={{ fontSize: '0.8rem' }}>Booked</div>
        )}
        {isLockedByOther && !isBooked && (
          <div className="small fw-normal mt-1 text-danger" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-lock-fill me-1"></i>Locked
          </div>
        )}
        {isLockedByMe && (
          <div className="small fw-normal mt-1 text-success" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-unlock-fill me-1"></i>Reserved
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
