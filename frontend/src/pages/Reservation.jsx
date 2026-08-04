import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import FloorMap from '../components/FloorMap.jsx';

function Reservation({ triggerToast }) {
  const { cart, clearCart } = useContext(CartContext);
  const { user, requireAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedTable, setSelectedTable] = useState('');
  const [bookings, setBookings] = useState({});
  const [bookedTables, setBookedTables] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '7:00 PM - 8:30 PM',
    guestCount: 2,
    tableId: ''
  });

  const [formErrors, setFormErrors] = useState({
    phone: '',
    date: ''
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [suggestedTable, setSuggestedTable] = useState('');
  const [inspectTable, setInspectTable] = useState(null);

  // Table metadata for the Inspect Modal
  const TABLE_DETAILS = {
    '1':  { zone: 'Window Views (Premium)', capacity: 2, config: 'Intimate window-side seating with panoramic street view. Perfect for couples.', icon: '🪟' },
    '2':  { zone: 'Window Views (Premium)', capacity: 2, config: 'Corner window table with natural daylight. Ideal for business lunches.', icon: '🪟' },
    '3':  { zone: 'Window Views (Premium)', capacity: 4, config: 'Extended window table with city skyline view. Great for small families.', icon: '🪟' },
    '4':  { zone: 'Window Views (Premium)', capacity: 4, config: 'Premium window booth with ambient curtain lighting. Signature dining experience.', icon: '🪟' },
    '5':  { zone: 'Main Dining Lounge', capacity: 4, config: 'Centrally located lounge table with vibrant atmosphere and open floor plan.', icon: '🍽️' },
    '6':  { zone: 'Main Dining Lounge', capacity: 4, config: 'Spacious lounge table near the live music stage. Energetic dining environment.', icon: '🍽️' },
    '7':  { zone: 'Main Dining Lounge', capacity: 6, config: 'Large round lounge table for group dining with lazy-susan service style.', icon: '🍽️' },
    '8':  { zone: 'Main Dining Lounge', capacity: 6, config: 'Family-sized lounge table with extra legroom and accessible seating arrangements.', icon: '🍽️' },
    '9':  { zone: 'Private Booths', capacity: 6, config: 'Curtained private booth with personalized service. Ideal for celebrations and meetings.', icon: '🎭' },
    '10': { zone: 'Private Booths', capacity: 8, config: 'Exclusive large booth with semi-private partitions. Perfect for corporate events.', icon: '🎭' },
  };

  // Read last_booked_table cookie on mount
  useEffect(() => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : '';
    };

    const cookieTable = getCookie('last_booked_table');
    if (cookieTable) {
      setSuggestedTable(cookieTable);
    }
  }, []);

  // Load existing bookings and check connection status on mount
  useEffect(() => {
    axios.get('/api/menu')
      .then(() => {
        // API is active, load bookings normally
        const savedBookings = JSON.parse(localStorage.getItem('restaurantBookings')) || {};
        setBookings(savedBookings);
      })
      .catch((err) => {
        console.warn('API is offline, using offline booking mode.', err);
        triggerToast('Server Offline: Table booking service is running in offline backup mode.');
        const savedBookings = JSON.parse(localStorage.getItem('restaurantBookings')) || {};
        setBookings(savedBookings);
      });
  }, []);

  // Fetch table availability for active Date and Time Slot
  useEffect(() => {
    if (!formData.date || !formData.timeSlot) return;

    axios.get('/api/reservations/availability', {
      params: {
        date: formData.date,
        timeSlot: formData.timeSlot
      }
    })
    .then((res) => {
      setBookedTables(res.data || []);
    })
    .catch((err) => {
      console.warn('Failed to fetch table availability, falling back to local simulation mode.', err);
      const savedBookings = JSON.parse(localStorage.getItem('restaurantBookings')) || {};
      const key = `${formData.date}_${formData.timeSlot}`;
      const localBooked = savedBookings[key] || [];
      setBookedTables(localBooked);
    });
  }, [formData.date, formData.timeSlot]);

  // Update table grid when selected date changes and release previous lock
  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    
    if (selectedTable) {
      try {
        await axios.post('/api/locks/release-lock', { tableId: selectedTable });
      } catch (releaseErr) {
        console.warn('Failed to release previous table lock on date change:', releaseErr.message);
      }
    }

    setFormData({ ...formData, date: newDate, tableId: '' });
    setSelectedTable(''); // Reset selection
    
    // Validate date input immediately
    const inputDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      setFormErrors((prev) => ({ ...prev, date: 'Please select today or a future date.' }));
    } else {
      setFormErrors((prev) => ({ ...prev, date: '' }));
    }
  };

  const handleNameChange = (e) => {
    const sanitizedName = e.target.value.replace(/[^A-Za-z ]/g, '');
    setFormData((prev) => ({ ...prev, name: sanitizedName }));
  };

  const handlePhoneChange = (e) => {
    const sanitizedPhone = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: sanitizedPhone }));
    
    if (sanitizedPhone.length > 0 && sanitizedPhone.length !== 10) {
      setFormErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits.' }));
    } else {
      setFormErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // Update formData when selectedTable changes via FloorMap locking
  useEffect(() => {
    setFormData(prev => ({ ...prev, tableId: selectedTable }));
  }, [selectedTable]);

  // Handle recovery of pending booking actions after successful login
  useEffect(() => {
    if (!user || !(user._id || user.id)) return;
    const pending = sessionStorage.getItem('pendingAction');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (parsed.type === 'BOOK_TABLE' && parsed.pathname === window.location.pathname) {
          const { tableId, formData: savedForm } = parsed.payload;
          setSelectedTable(tableId);
          setFormData(prev => ({
            ...prev,
            ...savedForm,
            tableId
          }));
          triggerToast(`✨ Restored your table #${tableId} reservation intent.`);
          sessionStorage.removeItem('pendingAction');
        }
      } catch (e) {
        console.error('Failed to restore pending booking intent:', e);
      }
    }
  }, [user]);

  const handleBookingSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validations
    if (!selectedTable) {
      alert('Please select a dining table first!');
      return;
    }

    requireAuth(
      async () => {
        const inputDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
          setFormErrors((prev) => ({ ...prev, date: 'Please select today or a future date.' }));
          return;
        }

        if (formData.phone.length !== 10) {
          setFormErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits.' }));
          return;
        }

        if (formData.guestCount < 1 || formData.guestCount > 20) {
          alert('Guests must be between 1 and 20.');
          return;
        }

        // Double check bookings
        if (bookedTables.includes(selectedTable)) {
          alert('This table is already booked for this specific time slot!');
          return;
        }

        // Dispatch POST request to backend
        const originalBtn = e && e.target ? e.target.querySelector('button[type="submit"]') : document.querySelector('button[type="submit"]');
        if (originalBtn) {
          originalBtn.disabled = true;
          originalBtn.innerText = 'Processing...';
        }

        const payload = {
          ...formData,
          tableId: selectedTable,
          preOrderItems: cart.map(item => ({
            menuItemId: item._id || item.id,
            name: item.name,
            quantity: item.qty || item.quantity || 1,
            price: item.price
          })),
          grandTotal: cart.reduce((total, item) => total + (item.price * (item.qty || 1)), 0)
        };

        try {
          const response = await axios.post('/api/reservations', payload);

          // Mark Table as Booked and persist in LocalStorage with compound key
          const key = `${formData.date}_${formData.timeSlot}`;
          const updatedBookings = { ...bookings };
          if (!updatedBookings[key]) {
            updatedBookings[key] = [];
          }
          updatedBookings[key].push(selectedTable);

          setBookings(updatedBookings);
          localStorage.setItem('restaurantBookings', JSON.stringify(updatedBookings));

          // Update local bookedTables state
          setBookedTables((prev) => [...prev, selectedTable]);

          // Trigger Confirmed Summary view
          setBookingConfirmed({
            name: formData.name,
            table: selectedTable,
            date: formData.date,
            timeSlot: formData.timeSlot,
            guests: formData.guestCount
          });

          triggerToast(`Table #${response.data.tableId} successfully reserved live!`);
          
          // Release table lock on backend on successful booking checkout
          try {
            await axios.post('/api/locks/release-lock', { tableId: selectedTable });
          } catch (releaseErr) {
            console.warn('Failed to release lock on booking checkout success:', releaseErr.message);
          }

          setSelectedTable('');
          clearCart();
        } catch (err) {
          console.error('Reservation API error:', err);
          alert('Failed to process reservation booking: ' + (err.response?.data?.error || err.message));
        } finally {
          if (originalBtn) {
            originalBtn.disabled = false;
            originalBtn.innerText = 'Confirm Booking';
          }
        }
      },
      { type: 'BOOK_TABLE', payload: { tableId: selectedTable, formData } },
      navigate
    );
  };

  const handleBookAnother = () => {
    setBookingConfirmed(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '7:00 PM - 8:30 PM',
      guestCount: 2,
      tableId: ''
    });
    setSelectedTable('');
    setFormErrors({ phone: '', date: '' });
  };

  return (
    <div className="reservation-viewport container mt-5 pt-5 mb-5 text-white">
      <h2 className="text-center mb-5 font-serif h1 text-warning">Book a Table</h2>
      
      {!bookingConfirmed ? (
        <>
          {suggestedTable && (
            <div 
              className="alert alert-warning bg-dark text-warning rounded-4 p-3 mb-4 d-flex align-items-center gap-3" 
              style={{ border: '1px solid #f2c94c' }}
            >
              <span className="fs-4">✨</span>
              <div>
                <strong>Welcome back!</strong> Your last successful reservation was at <span className="text-white fw-bold">Table #{suggestedTable}</span>.
              </div>
            </div>
          )}
          <div className="row">
            {/* Left Column: Visual Table Selector */}
            <div className="col-md-6 mb-5 mb-md-0 p-4 bg-dark border border-secondary rounded-4 shadow-sm">
              <h3 className="mb-4 font-serif text-warning">Select a Table</h3>
              
              <FloorMap 
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                bookedTables={bookedTables}
                triggerToast={triggerToast}
                onInspect={setInspectTable}
              />
              
              <p className="text-center mt-3 text-white-50 small">Click an available table to select it for reservation.</p>
            </div>

          {/* Right Column: Booking Form */}
          <div className="col-md-6 p-4 bg-dark border border-secondary rounded-4 shadow-sm">
            <h3 className="mb-4 font-serif text-warning">Reservation Details</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="mb-3">
                <label htmlFor="nameInput" className="form-label text-white-50">Name</label>
                <input 
                  type="text" 
                  className="form-control premium-form-input" 
                  id="nameInput" 
                  value={formData.name}
                  onChange={handleNameChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phoneInput" className="form-label text-white-50">Phone</label>
                <input 
                  type="tel" 
                  className="form-control premium-form-input" 
                  id="phoneInput" 
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required 
                />
                {formErrors.phone && <small className="text-danger fw-bold d-block mt-1">{formErrors.phone}</small>}
              </div>

              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label text-white-50">Email</label>
                <input 
                  type="email" 
                  className="form-control premium-form-input" 
                  id="emailInput" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="dateInput" className="form-label text-white-50">Date</label>
                <input 
                  type="date" 
                  className="form-control premium-form-input" 
                  id="dateInput" 
                  value={formData.date}
                  onChange={handleDateChange}
                  required 
                />
                {formErrors.date && <small className="text-danger fw-bold d-block mt-1">{formErrors.date}</small>}
              </div>

              <div className="mb-3">
                <label htmlFor="timeSlotInput" className="form-label text-white-50">Time Slot</label>
                <select 
                  className="form-select premium-form-input" 
                  id="timeSlotInput" 
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  required
                >
                  <option value="12:00 PM - 1:30 PM">12:00 PM - 1:30 PM</option>
                  <option value="7:00 PM - 8:30 PM">7:00 PM - 8:30 PM</option>
                  <option value="8:30 PM - 10:00 PM">8:30 PM - 10:00 PM</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="guestCountInput" className="form-label text-white-50">Guest Count</label>
                <input 
                  type="number" 
                  className="form-control premium-form-input" 
                  id="guestCountInput" 
                  min="1" 
                  max="20" 
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-warning w-100 rounded-pill py-3 fw-bold text-dark shadow-sm"
                disabled={!!formErrors.phone || !!formErrors.date}
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
        </>
      ) : (
        /* Confirmed Summary View */
        <div className="row justify-content-center">
          <div className="col-md-6 p-5 bg-dark border border-secondary rounded-4 shadow-sm text-center">
            <div className="text-success mb-3" style={{ fontSize: '4rem' }}>✅</div>
            <h3 className="mb-3 font-serif text-warning h2">Booking Confirmed!</h3>
            <p className="text-white-50 mb-4 fs-5">Thank you, <span className="fw-bold text-white">{bookingConfirmed.name}</span>!</p>
            
            <div className="alert alert-dark bg-secondary bg-opacity-20 border border-secondary rounded-4 p-4 text-start text-white mb-4">
              <p className="mb-2 fs-5"><strong>Table No:</strong> <span className="text-warning fw-bold">#{bookingConfirmed.table}</span></p>
              <p className="mb-2 fs-5"><strong>Date:</strong> <span className="text-warning">{bookingConfirmed.date}</span></p>
              <p className="mb-2 fs-5"><strong>Time Slot:</strong> <span className="text-warning">{bookingConfirmed.timeSlot}</span></p>
              <p className="mb-0 fs-5"><strong>Guests:</strong> <span className="text-warning">{bookingConfirmed.guests}</span></p>
            </div>
            
            <p className="small text-white-50 mt-3 mb-4">A confirmation receipt has been sent to your email address.</p>
            
            <button className="btn btn-outline-warning rounded-pill px-4" onClick={handleBookAnother}>
              Book Another Table
            </button>
          </div>
        </div>
      )}

      {/* ── Inspect Table Details Modal ── */}
      {inspectTable && (() => {
        const details = TABLE_DETAILS[inspectTable];
        return (
          <>
            {/* Backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 1055 }}
              onClick={() => setInspectTable(null)}
            />
            {/* Modal */}
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ zIndex: 1060 }}
            >
              <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
                <div className="modal-content bg-dark border border-warning text-white rounded-4 shadow-lg overflow-hidden">

                  {/* Header */}
                  <div className="modal-header border-bottom border-secondary px-4 py-3 d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.6rem' }}>{details.icon}</span>
                    <div>
                      <h5 className="modal-title fw-bold text-warning font-serif mb-0">
                        Table #{inspectTable}
                      </h5>
                      <small className="text-white-50">{details.zone}</small>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-auto"
                      onClick={() => setInspectTable(null)}
                      aria-label="Close"
                    />
                  </div>

                  {/* Body */}
                  <div className="modal-body px-4 py-4">
                    <div className="d-flex flex-column gap-3">

                      <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <i className="bi bi-people-fill text-warning fs-5 mt-1"></i>
                        <div>
                          <div className="fw-bold text-white-75 small text-uppercase" style={{ letterSpacing: '0.05em' }}>Seating Capacity</div>
                          <div className="text-white fw-bold fs-5">{details.capacity} Guests</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <i className="bi bi-geo-alt-fill text-warning fs-5 mt-1"></i>
                        <div>
                          <div className="fw-bold text-white-75 small text-uppercase" style={{ letterSpacing: '0.05em' }}>Zone Location</div>
                          <div className="text-white fw-bold">{details.zone}</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <i className="bi bi-card-text text-warning fs-5 mt-1"></i>
                        <div>
                          <div className="fw-bold text-white-75 small text-uppercase" style={{ letterSpacing: '0.05em' }}>Configuration</div>
                          <div className="text-white-50" style={{ lineHeight: '1.5' }}>{details.config}</div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer border-top border-secondary px-4 py-3">
                    <span className="text-success small me-auto">
                      <i className="bi bi-check-circle-fill me-1"></i>Currently Selected
                    </span>
                    <button
                      type="button"
                      className="btn btn-warning text-dark fw-bold rounded-pill px-4"
                      onClick={() => setInspectTable(null)}
                    >
                      Close
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </>
        );
      })()}

    </div>
  );
}

export default Reservation;
