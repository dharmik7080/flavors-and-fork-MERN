import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';

function Reservation({ triggerToast }) {
  const { cart, clearCart } = useContext(CartContext);
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

  // Update table grid when selected date changes
  const handleDateChange = (e) => {
    const newDate = e.target.value;
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

  const handleTableClick = (tableNum) => {
    const tableId = String(tableNum);
    if (bookedTables.includes(tableId)) {
      return; // Table is booked, prevent click
    }
    setSelectedTable(tableId);
    setFormData((prev) => ({ ...prev, tableId }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!selectedTable) {
      alert('Please select a dining table first!');
      return;
    }

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
    const originalBtn = e.target.querySelector('button[type="submit"]');
    originalBtn.disabled = true;
    originalBtn.innerText = 'Processing...';

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
      setSelectedTable('');
      clearCart();
    } catch (err) {
      console.error('Reservation API error:', err);
      alert('Failed to process reservation booking: ' + (err.response?.data?.error || err.message));
    } finally {
      originalBtn.disabled = false;
      originalBtn.innerText = 'Confirm Booking';
    }
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

  const renderTableCard = (tableNum, zone) => {
    const tableId = String(tableNum);
    const isBooked = bookedTables.includes(tableId);
    const isSelected = selectedTable === tableId;

    let stateClass = 'available';
    if (isBooked) stateClass = 'booked';
    else if (isSelected) stateClass = 'selected';

    let zoneClass = '';
    if (zone === 'window') zoneClass = 'zone-window';
    else if (zone === 'lounge') zoneClass = 'zone-lounge';
    else if (zone === 'booth') zoneClass = 'zone-booth';

    return (
      <div 
        key={tableId}
        onClick={() => handleTableClick(tableId)}
        className={`table-card ${stateClass} ${zoneClass}`}
      >
        Table #{tableId}
        {isBooked && (
          <div className="small fw-normal mt-1" style={{ fontSize: '0.8rem' }}>Booked</div>
        )}
      </div>
    );
  };

  return (
    <div className="reservation-viewport container my-5 text-white">
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
            
            {/* Seating Layout Groups */}
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
    </div>
  );
}

export default Reservation;
