import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';
import MenuSkeleton from '../components/MenuSkeleton.jsx';

// Static menu data fallback (exact 15 items from menu.json)
const localMenuData = [
  {
    "id": 1,
    "name": "Paneer Tikka Masala",
    "category": "main",
    "type": "veg",
    "price": 350,
    "description": "Char-grilled paneer cubes in rich tomato gravy.",
    "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 2,
    "name": "Chicken Kung Pao",
    "category": "main",
    "type": "non-veg",
    "price": 280,
    "description": "Spicy diced chicken with peanuts and chili peppers.",
    "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 3,
    "name": "Margherita Pizza",
    "category": "main",
    "type": "veg",
    "price": 400,
    "description": "Classic Italian pizza with fresh mozzarella and basil.",
    "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 4,
    "name": "Hakka Noodles",
    "category": "main",
    "type": "veg",
    "price": 220,
    "description": "Stir-fried noodles with crunchy vegetables.",
    "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 5,
    "name": "Butter Chicken",
    "category": "main",
    "type": "non-veg",
    "price": 380,
    "description": "Chicken cooked in a smooth, buttery tomato sauce.",
    "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 6,
    "name": "Chocolate Brownie",
    "category": "dessert",
    "type": "veg",
    "price": 180,
    "description": "Fudgy walnut brownie served sizzling hot.",
    "image": "https://images.unsplash.com/photo-1606313564200-e75d5e304abd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 7,
    "name": "Veg Spring Rolls",
    "category": "starter",
    "type": "veg",
    "price": 180,
    "description": "Crispy golden rolls filled with savoury vegetables.",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 8,
    "name": "Pasta Alfredo",
    "category": "main",
    "type": "veg",
    "price": 320,
    "description": "Penne pasta tossed in a creamy white cheese sauce.",
    "image": "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 9,
    "name": "Mojito",
    "category": "beverage",
    "type": "veg",
    "price": 150,
    "description": "Refreshing mint and lime cooler.",
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 10,
    "name": "Gulab Jamun",
    "category": "dessert",
    "type": "veg",
    "price": 150,
    "description": "Soft fried dough balls soaked in sugar syrup.",
    "image": "https://placehold.co/600x400/orange/white?text=Gulab+Jamun"
  },
  {
    "id": 11,
    "name": "Manchow Soup",
    "category": "starter",
    "type": "veg",
    "price": 160,
    "description": "Spicy Chinese soup topped with fried noodles.",
    "image": "https://placehold.co/600x400/darkred/white?text=Manchow+Soup"
  },
  {
    "id": 12,
    "name": "Cold Coffee",
    "category": "beverage",
    "type": "veg",
    "price": 180,
    "description": "Classic chilled coffee blended with ice cream.",
    "image": "https://placehold.co/600x400/6f4e37/white?text=Cold+Coffee"
  },
  {
    "id": 13,
    "name": "Masala Chai",
    "category": "beverage",
    "type": "veg",
    "price": 80,
    "description": "Traditional Indian tea brewed with spices.",
    "image": "https://placehold.co/600x400/c68c53/white?text=Masala+Chai"
  },
  {
    "id": 14,
    "name": "Garlic Bread",
    "category": "starter",
    "type": "veg",
    "price": 140,
    "description": "Toasted bread slices infused with garlic butter.",
    "image": "https://placehold.co/600x400/f2c94c/black?text=Garlic+Bread"
  },
  {
    "id": 15,
    "name": "Szechuan Fried Rice",
    "category": "main",
    "type": "veg",
    "price": 240,
    "description": "Spicy fried rice wok-tossed with szechuan sauce.",
    "image": "https://placehold.co/600x400/eb5757/white?text=Fried+Rice"
  }
];

function Menu({ triggerToast }) {
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    discount,
    setDiscount,
    showCartDrawer,
    setShowCartDrawer,
    totalItemsCount,
    subtotal,
    gst,
    platformFee,
    grandTotal
  } = useContext(CartContext);

  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState({ text: '', type: '' });

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load favorites from local storage
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavs);
  }, []);

  // Fetch Dishes from API using axios, supporting live query/category searching via Express API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        // Simulate a minor network delay for skeleton shimmer UX polish (1.0s)
        await new Promise(resolve => setTimeout(resolve, 1000));

        let res;
        // If searchQuery or activeCategory is active, query backend search endpoint
        if (searchQuery || (activeCategory && activeCategory !== 'all')) {
          res = await axios.get('/api/menu/search', {
            params: { q: searchQuery, category: activeCategory }
          });
        } else {
          // Otherwise stream all data from backend
          res = await axios.get('/api/menu');
        }

        if (res.data && res.data.length > 0) {
          setMenuItems(res.data);
        } else {
          setMenuItems(searchQuery || (activeCategory && activeCategory !== 'all') ? [] : localMenuData);
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local static catalog.', err);
        triggerToast('Error: Failed to connect to the backend server. Using local offline data.');
        if (!searchQuery && activeCategory === 'all') {
          setMenuItems(localMenuData);
        } else {
          setMenuItems([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [searchQuery, activeCategory]);

  // Favorite toggle
  const toggleFavorite = (id) => {
    let updatedFavs = [...favorites];
    if (updatedFavs.includes(id)) {
      updatedFavs = updatedFavs.filter(favId => favId !== id);
    } else {
      updatedFavs.push(id);
      triggerToast('Added to Favorites!');
    }
    setFavorites(updatedFavs);
    localStorage.setItem('favorites', JSON.stringify(updatedFavs));
  };

  // Promo Code Validation
  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();
    const validCodes = {
      'BDAY20': 0.20,
      'WELCOME10': 0.10,
      'FLAVOR50': 0.50
    };

    if (validCodes.hasOwnProperty(code)) {
      const discountVal = subtotal * validCodes[code];
      setDiscount(discountVal);
      setPromoMsg({ text: `Discount applied: -₹${Math.round(discountVal)}`, type: 'success' });
    } else {
      setPromoMsg({ text: code === '' ? 'Please enter a code.' : 'Invalid promo code.', type: 'error' });
      setDiscount(0);
    }
  };

  // Payment Confirmation with backend API request
  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    
    axios.post('/api/orders/checkout', {
      email: 'customer@flavorsandfork.com', // mock client email
      items: cart,
      grandTotal: grandTotal
    })
    .then((res) => {
      const orderId = Math.floor(Math.random() * 9000 + 1000);
      let successMsg = `Order #ORD-${orderId} placed via ${paymentMethod}!`;
      if (res.data.previewUrl) {
        successMsg += ` (Invoice email sent!)`;
        console.log('Nodemailer test preview invoice link:', res.data.previewUrl);
      }
      triggerToast(successMsg);

      // Reset cart and states
      clearCart();
      setPromoCode('');
      setPromoMsg({ text: '', type: '' });
      setPaymentMethod('');
      setShowPaymentModal(false);
      setShowCartDrawer(false);
    })
    .catch((err) => {
      console.error('Checkout API error:', err);
      alert('Order Placement Failed: Connection to the checkout service was lost. Please check if the backend is online.');
    })
    .finally(() => {
      setIsProcessingPayment(false);
    });
  };

  const sortedItems = [...menuItems].sort((a, b) => {
    if (sortBy === 'low-to-high') return a.price - b.price;
    if (sortBy === 'high-to-low') return b.price - a.price;
    return 0; // 'default' leaves order untouched
  });

  return (
    <div className="menu-viewport">
      <style>{`
        input::placeholder {
          color: #f2c94c !important;
          opacity: 0.7 !important;
        }
      `}</style>
      {/* Search and Filters */}
      <div className="container mt-4 mb-3">
        {/* Search and Sort Row */}
        <div className="d-flex flex-wrap justify-content-end gap-3 mb-4">
          {/* Price Sorting Selector */}
          <div style={{ minWidth: '185px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select bg-dark border-warning text-warning rounded-pill px-3"
              style={{
                borderColor: '#f2c94c',
                color: '#f2c94c',
                cursor: 'pointer'
              }}
            >
              <option value="default" className="bg-dark text-warning">Default Sort</option>
              <option value="low-to-high" className="bg-dark text-warning">Price: Low to High</option>
              <option value="high-to-low" className="bg-dark text-warning">Price: High to Low</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="input-group search-pill" style={{ maxWidth: '280px' }}>
            <input 
              type="search" 
              className="form-control bg-dark text-[#f2c94c] border-secondary placeholder-[#f2c94c]" 
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: '#f2c94c' }}
            />
            <span className="input-group-text bg-dark border-secondary" style={{ color: '#f2c94c' }}>
              <i className="bi bi-search" style={{ color: '#f2c94c' }}></i>
            </span>
          </div>
        </div>

        {/* Filter Bar (Isolated Sticky pill button rows) */}
        <div 
          className="row justify-content-center" 
          style={{
            position: 'sticky',
            top: '20px',
            zIndex: 1000,
            backgroundColor: 'rgba(11, 15, 25, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50px',
            padding: '10px 20px',
            border: '1px solid var(--border-color)',
            marginBottom: '40px'
          }}
        >
          <div className="col-md-12 text-center">
            <div className="btn-group flex-wrap gap-2 justify-content-center" role="group">
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'all' ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'veg' ? 'btn-success text-white fw-bold' : 'btn-outline-success'}`}
                onClick={() => setActiveCategory('veg')}
              >
                Veg
              </button>
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'non-veg' ? 'btn-danger text-white fw-bold' : 'btn-outline-danger'}`}
                onClick={() => setActiveCategory('non-veg')}
              >
                Non-Veg
              </button>
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'starters' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                onClick={() => setActiveCategory('starters')}
              >
                Starters
              </button>
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'main' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                onClick={() => setActiveCategory('main')}
              >
                Main Course
              </button>
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'desserts' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                onClick={() => setActiveCategory('desserts')}
              >
                Desserts
              </button>
              <button 
                type="button" 
                className={`btn rounded-pill px-4 btn-sm ${activeCategory === 'beverages' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                onClick={() => setActiveCategory('beverages')}
              >
                Beverages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container">
        <h2 className="text-center mb-5 font-serif h1 text-warning">Our Menu</h2>
        
        {isLoading ? (
          <MenuSkeleton />
        ) : (
          <div className="row">
            {sortedItems.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="fs-5 text-white-50">No dishes matched your filters.</p>
              </div>
            ) : (
              sortedItems.map(dish => {
                const cartItem = cart.find(item => item.id === dish.id);
                const isFavorite = favorites.includes(dish.id);

                return (
                  <div key={dish.id} className="col-md-4 mb-4">
                    <div className="card h-100 border border-secondary bg-dark text-white rounded-4 overflow-hidden position-relative shadow-sm hover-card">
                      <button 
                        onClick={() => toggleFavorite(dish.id)} 
                        className="btn btn-sm position-absolute top-0 end-0 m-3 rounded-circle bg-dark bg-opacity-70 border-0"
                        style={{ zIndex: 10, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className={`bi ${isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart text-white-50'}`}></i>
                      </button>
                      <img 
                        src={dish.image} 
                        className="card-img-top" 
                        alt={dish.name} 
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body d-flex flex-column p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="card-title mb-0 font-serif fw-bold">{dish.name}</h5>
                          <span className="badge bg-warning text-dark rounded-pill fw-bold">₹{dish.price}</span>
                        </div>
                        <p className="card-text text-white-50 small mb-4">{dish.description}</p>
                        
                        <div className="mt-auto">
                          {cartItem ? (
                            <div className="d-flex justify-content-between align-items-center w-100 border border-secondary rounded-pill p-1">
                              <button 
                                className="btn btn-outline-danger btn-sm rounded-circle" 
                                onClick={() => removeFromCart(dish.id)}
                                style={{ width: '32px', height: '32px', padding: 0 }}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="fw-bold fs-5">{cartItem.qty}</span>
                              <button 
                                className="btn btn-outline-success btn-sm rounded-circle" 
                                onClick={() => addToCart(dish)}
                                style={{ width: '32px', height: '32px', padding: 0 }}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="btn btn-outline-warning w-100 rounded-pill py-2 fw-bold" 
                              onClick={() => addToCart(dish)}
                            >
                              Add to Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div 
          className="fixed-bottom bg-success text-white p-3 shadow-lg d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', zIndex: 1050, transition: 'all 0.3s ease' }}
          onClick={() => setShowCartDrawer(true)}
        >
          <h5 className="mb-0 ms-2"><i className="bi bi-cart4 me-2"></i>{cart.reduce((qty, item) => qty + item.qty, 0)} Items</h5>
          <h5 className="mb-0 me-3">Total: ₹{grandTotal} <i className="bi bi-chevron-up ms-2 small"></i></h5>
        </div>
      )}

      {/* Cart Drawer (HTML Ported as slide-in drawer) */}
      <div 
        className={`offcanvas offcanvas-bottom h-auto bg-dark text-white border-top border-secondary ${showCartDrawer ? 'show' : ''}`}
        style={{ 
          visibility: showCartDrawer ? 'visible' : 'hidden',
          minHeight: '40vh',
          maxHeight: '80vh',
          zIndex: 1060,
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          transition: 'transform 0.35s ease-in-out',
          transform: showCartDrawer ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        <div className="offcanvas-header border-bottom border-secondary bg-dark d-flex justify-content-between p-3">
          <h5 className="offcanvas-title fw-bold text-warning font-serif">Your Order</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={() => setShowCartDrawer(false)}
          ></button>
        </div>
        <div className="offcanvas-body p-4" style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 70px)' }}>
          <div className="mb-4">
            {cart.length === 0 ? (
              <p className="text-white-50 text-center mt-5">Your cart is empty.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item-card mb-3 p-3 bg-dark border border-secondary rounded-4 position-relative">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-white mb-1 fw-bold">{item.name}</h6>
                      <div className="d-flex align-items-center">
                        <span className="text-warning fw-bold me-2">{item.qty}x</span>
                        <small className="text-white-50">₹{item.price} x {item.qty} = ₹{item.price * item.qty}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}>
                        <i className="bi bi-dash"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-success" onClick={() => addToCart(item)}>
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-top border-secondary pt-3">
              {/* Promo Code section */}
              <div className="my-3">
                <div className="input-group">
                  <span className="input-group-text bg-dark text-white border-secondary"><i className="bi bi-tags-fill"></i></span>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={discount > 0}
                  />
                  <button 
                    className={`btn ${discount > 0 ? 'btn-success text-white' : 'btn-warning text-dark'} fw-bold`}
                    type="button"
                    onClick={applyPromoCode}
                    disabled={discount > 0}
                  >
                    {discount > 0 ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoMsg.text && (
                  <p className={`mt-2 mb-0 small fw-bold ${promoMsg.type === 'success' ? 'text-success' : 'text-danger'}`}>
                    {promoMsg.text}
                  </p>
                )}
              </div>

              {/* Receipt Calculation Details */}
              <div className="bill-receipt-card p-3 border border-secondary rounded-4 bg-dark">
                <div className="d-flex justify-content-between mb-2">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-white-50 small">
                  <span>Taxes & Charges (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-white-50 small">
                  <span>Platform Fee</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success small fw-bold">
                    <span>Discount Applied</span>
                    <span>-₹{Math.round(discount)}</span>
                  </div>
                )}
                
                <hr className="border-secondary my-3" />
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-5 fw-bold">To Pay</span>
                  <span className="fs-2 fw-bold text-warning font-serif">₹{grandTotal}</span>
                </div>
                
                <button 
                  className="btn btn-warning w-100 py-3 fw-bold rounded-pill" 
                  onClick={() => setShowPaymentModal(true)}
                >
                  Place Order <i class="bi bi-arrow-right-circle-fill ms-2"></i>
                </button>
                
                <button 
                  className="btn btn-outline-danger w-100 rounded-pill mt-2" 
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Selection Modal (HTML Ported) */}
      {showPaymentModal && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          role="dialog"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border border-secondary shadow-lg p-3 rounded-4">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning fw-bold font-serif">
                  <i className="bi bi-wallet2 me-2"></i>Select Payment Method
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    if (!isProcessingPayment) setShowPaymentModal(false);
                  }}
                ></button>
              </div>
              <div className="modal-body py-4">
                {!paymentMethod ? (
                  /* Step 1: Selection */
                  <div className="d-grid gap-3">
                    <button 
                      className="btn btn-outline-warning text-start p-3 d-flex align-items-center justify-content-between"
                      onClick={() => setPaymentMethod('UPI')}
                    >
                      <span><i className="bi bi-qr-code me-2"></i> UPI / Google Pay</span>
                    </button>
                    <button 
                      className="btn btn-outline-warning text-start p-3 d-flex align-items-center justify-content-between"
                      onClick={() => setPaymentMethod('Card')}
                    >
                      <span><i className="bi bi-credit-card me-2"></i> Credit / Debit Card</span>
                    </button>
                    <button 
                      className="btn btn-outline-warning text-start p-3 d-flex align-items-center justify-content-between"
                      onClick={() => setPaymentMethod('Cash')}
                    >
                      <span><i className="bi bi-cash-stack me-2"></i> Cash on Delivery</span>
                    </button>
                  </div>
                ) : (
                  /* Step 2: Processing and confirmation */
                  <div>
                    <h6 className="text-center text-white-50 mb-4">
                      Selected Method: <span className="text-warning fw-bold">{paymentMethod}</span>
                    </h6>
                    <div className="bg-white text-dark p-3 rounded-4 d-flex justify-content-between align-items-center fw-bold mb-4">
                      <span>Total Payable:</span>
                      <span className="fs-5">₹{grandTotal}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-secondary w-50" 
                        onClick={() => setPaymentMethod('')}
                        disabled={isProcessingPayment}
                      >
                        <i className="bi bi-arrow-left me-2"></i>Back
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-success fw-bold w-50"
                        onClick={handleConfirmPayment}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <>
                            Processing...
                            <span className="spinner-border spinner-border-sm ms-2"></span>
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary w-100" 
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;
