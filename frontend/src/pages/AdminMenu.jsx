import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function AdminMenu() {
  const { user } = useContext(AuthContext);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('main');
  const [type, setType] = useState('veg');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Fetch all dishes on mount
  const fetchDishes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/menu');
      setDishes(response.data);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setErrorMsg('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !price || !category || !type || !description) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!imageUrl && !imageFile) {
      setErrorMsg('Please provide either an image URL or upload an image file.');
      return;
    }

    try {
      setSubmitting(true);
      let finalImageUrl = imageUrl;

      // Handle file upload if present
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data && uploadRes.data.filePath) {
          finalImageUrl = uploadRes.data.filePath;
        } else {
          throw new Error('Image upload failed to return path.');
        }
      }

      // Create new dish entry
      const response = await axios.post('/api/menu', {
        name,
        category,
        type,
        price: Number(price),
        description,
        image: finalImageUrl
      });

      if (response.data.status === 'success') {
        setSuccessMsg(`"${name}" created successfully!`);
        // Reset form inputs
        setName('');
        setPrice('');
        setCategory('main');
        setType('veg');
        setDescription('');
        setImageUrl('');
        setImageFile(null);
        // Clear file input manually
        const fileInput = document.getElementById('dish-file-input');
        if (fileInput) fileInput.value = '';
        
        // Refresh items
        fetchDishes();
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to save menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete dish handler
  const handleDelete = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/menu/${dishId}`);
      if (response.data.status === 'success') {
        setSuccessMsg(`"${dishName}" deleted successfully!`);
        fetchDishes();
      }
    } catch (err) {
      console.error('Failed to delete dish:', err);
      setErrorMsg('Failed to delete menu item.');
    }
  };

  return (
    <div className="container py-5 text-white" style={{ minHeight: '80vh' }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold text-warning font-serif display-4">Admin Menu Management</h1>
        <p className="text-white-50">Create, view, and delete options from the restaurant menu catalog.</p>
      </div>

      <div className="row g-5">
        {/* Create Dish Form */}
        <div className="col-lg-5">
          <div className="card bg-dark border border-secondary rounded-4 shadow p-4">
            <h3 className="text-warning font-serif mb-4 border-bottom border-secondary pb-2">Add New Menu Item</h3>
            
            {errorMsg && <div className="alert alert-danger rounded-pill px-4" role="alert">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success rounded-pill px-4" role="alert">{successMsg}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold text-white-50">Dish Name</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Paneer Tikka Masala"
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-white-50">Price (INR)</label>
                  <input 
                    type="number" 
                    className="form-control bg-dark border-secondary text-white" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="e.g. 350"
                    min="0"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-white-50">Type</label>
                  <select 
                    className="form-select bg-dark border-secondary text-white" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-white-50">Category</label>
                <select 
                  className="form-select bg-dark border-secondary text-white" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="starters">Starters</option>
                  <option value="main">Main Course</option>
                  <option value="desserts">Desserts</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-white-50">Description</label>
                <textarea 
                  className="form-control bg-dark border-secondary text-white" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Provide a delicious description of the ingredients and preparation method..."
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-white-50 d-block">Image Source</label>
                
                {/* Image URL text field */}
                <div className="mb-2">
                  <input 
                    type="text" 
                    className="form-control bg-dark border-secondary text-white form-control-sm" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="Paste a direct image link (e.g. Unsplash URL)..."
                    disabled={!!imageFile}
                  />
                </div>

                <div className="text-center my-2 text-white-50 fs-7">OR</div>

                {/* Local file uploader */}
                <div>
                  <input 
                    id="dish-file-input"
                    type="file" 
                    className="form-control bg-dark border-secondary text-white form-control-sm" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0] || null)}
                    disabled={!!imageUrl}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-warning w-100 rounded-pill py-2 shadowfw-bold text-dark d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving Dish...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle-fill"></i> Save Menu Item
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Dishes List */}
        <div className="col-lg-7">
          <div className="card bg-dark border border-secondary rounded-4 shadow p-4">
            <h3 className="text-warning font-serif mb-4 border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center">
              <span>Current Menu Catalog</span>
              <span className="badge bg-secondary fs-6 rounded-pill">{dishes.length} Items</span>
            </h3>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading catalog...</span>
                </div>
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center text-white-50 py-5">
                <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                No items found in the menu. Seed the database or add one above!
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                <table className="table table-dark table-hover align-middle border-secondary mb-0">
                  <thead className="table-light text-dark">
                    <tr>
                      <th scope="col" style={{ width: '80px' }}>Image</th>
                      <th scope="col">Dish Info</th>
                      <th scope="col" className="text-end">Price</th>
                      <th scope="col" className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.map((dish) => (
                      <tr key={dish.id} className="border-secondary">
                        <td>
                          <img 
                            src={dish.image.startsWith('/') ? dish.image : dish.image} 
                            alt={dish.name} 
                            className="rounded shadow-sm"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x100?text=Food';
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold">{dish.name}</div>
                          <div className="d-flex gap-2 my-1">
                            <span className="badge bg-warning text-dark text-uppercase" style={{ fontSize: '0.65rem' }}>
                              {dish.category}
                            </span>
                            <span className={`badge text-uppercase ${dish.type === 'veg' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.65rem' }}>
                              {dish.type}
                            </span>
                          </div>
                          <small className="text-white-50 text-truncate d-inline-block" style={{ maxWidth: '280px' }}>
                            {dish.description}
                          </small>
                        </td>
                        <td className="text-end fw-bold text-warning">₹{dish.price}</td>
                        <td className="text-center">
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-circle p-2 d-inline-flex align-items-center justify-content-center"
                            onClick={() => handleDelete(dish.id, dish.name)}
                            title="Delete dish"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMenu;
