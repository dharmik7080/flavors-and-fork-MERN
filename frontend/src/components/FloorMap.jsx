import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function FloorMap({ selectedTable, setSelectedTable, bookedTables, triggerToast, onInspect }) {
  const { user } = useContext(AuthContext);
  const [activeLocks, setActiveLocks] = useState([]);
  const [pollingErrorCount, setPollingErrorCount] = useState(0);

  // Get or create a unique guest session ID
  const getGuestId = () => {
    let guestId = localStorage.getItem('flavorsAndForkGuestId');
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      localStorage.setItem('flavorsAndForkGuestId', guestId);
    }
    return guestId;
  };

  // 1. HTTP Polling every 3 seconds to fetch active table locks
  useEffect(() => {
    const fetchActiveLocks = async () => {
      try {
        const response = await axios.get('/api/locks/active-locks');
        setActiveLocks(response.data || []);
        setPollingErrorCount(0); // Reset errors on successful fetch
      } catch (err) {
        console.warn('Failed to poll active table locks:', err.message);
        setPollingErrorCount(prev => prev + 1);
      }
    };

    // Initial fetch
    fetchActiveLocks();

    const interval = setInterval(fetchActiveLocks, 3000);
    return () => clearInterval(interval);
  }, []);

  // Release lock on component unmount if user has a locked table
  useEffect(() => {
    return () => {
      if (selectedTable) {
        const userId = (user && (user._id || user.id)) || getGuestId();
        axios.post('/api/locks/release-lock', {
          tableId: selectedTable,
          userId
        }).catch(err => console.warn('Clean unmount lock release failed:', err.message));
      }
    };
  }, [selectedTable, user]);

  const handleTableClick = async (tableId) => {
    if (bookedTables.includes(tableId)) {
      return; // Table is permanently booked
    }

    const userId = (user && (user._id || user.id)) || getGuestId();
    const currentLock = activeLocks.find(lock => lock.tableId === String(tableId));
    const isLockedByOther = currentLock && currentLock.lockedBy !== userId;
    const isLockedByMe = selectedTable === tableId;

    if (isLockedByOther) {
      triggerToast('❌ This table is locked by another customer. Please select another table.');
      return;
    }

    if (isLockedByMe) {
      // Release lock locally
      setSelectedTable('');
      
      // Silently release on backend in background only if logged in
      if (user) {
        try {
          await axios.post('/api/locks/release-lock', {
            tableId,
            userId
          });
        } catch (err) {
          console.warn('Failed to release lock silently:', err.message);
        }
      }
    } else {
      // Select new table locally
      setSelectedTable(tableId);

      // Perform backend lock operations silently only if logged in
      if (user) {
        try {
          // If the user already had another table selected, release that lock first silently
          if (selectedTable) {
            try {
              await axios.post('/api/locks/release-lock', {
                tableId: selectedTable,
                userId
              });
            } catch (releaseErr) {
              console.warn('Failed to release previous table lock:', releaseErr.message);
            }
          }

          // Acquire new lock
          const response = await axios.post('/api/locks/lock-table', {
            tableId,
            userId
          });

          if (response.data.success) {
            // Instantly refresh locks list to reflect locally
            const updatedLocks = await axios.get('/api/locks/active-locks');
            setActiveLocks(updatedLocks.data || []);
          }
        } catch (err) {
          if (err.response?.status === 409) {
            triggerToast('❌ Conflict: This table was just locked by another customer!');
            // Refresh list to show updated status
            const updatedLocks = await axios.get('/api/locks/active-locks');
            setActiveLocks(updatedLocks.data || []);
            // De-select locally since it's locked by other
            setSelectedTable('');
          } else {
            console.warn('Silent lock acquisition failed:', err.message);
          }
        }
      }
    }
  };

  const renderTableCard = (tableNum, zone) => {
    const tableId = String(tableNum);
    const isBooked = bookedTables.includes(tableId);
    
    // Determine locks state
    const userId = (user && (user._id || user.id)) || getGuestId();
    const currentLock = activeLocks.find(lock => lock.tableId === tableId);
    
    const isLockedByMe = selectedTable === tableId || (currentLock && currentLock.lockedBy === userId);
    const isLockedByOther = currentLock && currentLock.lockedBy !== userId;

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
      {/* Connection Offline Indicator */}
      {pollingErrorCount >= 3 && (
        <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger rounded-3 p-2 mb-2 small text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Connection interrupted. Lock sync is currently running offline.
        </div>
      )}

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
