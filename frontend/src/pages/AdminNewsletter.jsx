import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminNewsletter({ triggerToast }) {
  const [subscribers, setSubscribers] = useState([]);
  const [subCount, setSubCount] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const [feedback, setFeedback] = useState({
    type: '', // 'success' or 'error'
    text: ''
  });

  // Fetch subscribers list and statistics on mount
  const fetchSubscribers = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get('/api/newsletter/subscribers');
      if (res.data && res.data.status === 'success') {
        setSubscribers(res.data.subscribers || []);
        setSubCount(res.data.count || 0);
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      if (triggerToast) {
        triggerToast('Error: Failed to fetch newsletter subscribers.');
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, name, value }));
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      setFeedback({ type: 'error', text: 'Please fill out both the Subject and Message fields.' });
      return;
    }

    try {
      setSendingBroadcast(true);
      setFeedback({ type: '', text: '' });
      
      const response = await axios.post('/api/newsletter/broadcast', {
        subject: formData.subject,
        message: formData.message
      });

      if (response.data && response.data.status === 'success') {
        setFeedback({
          type: 'success',
          text: `Broadcast dispatched successfully to ${response.data.recipientCount} subscribers!`
        });
        setFormData({ subject: '', message: '' });
        if (triggerToast) {
          triggerToast('Newsletter broadcast sent successfully!');
        }
      }
    } catch (err) {
      console.error('Broadcast failed:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.error || 'Failed to dispatch broadcast. Please check server logs.'
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="container my-5 text-white">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h1 className="fw-bold text-warning font-serif display-4">Newsletter Management</h1>
          <p className="text-white-50">Compose broadcasts and view your active subscriber mailing lists.</p>
        </div>
        <button 
          onClick={fetchSubscribers} 
          className="btn btn-outline-warning rounded-pill px-4 align-self-start align-self-md-center"
          disabled={loadingList}
        >
          {loadingList ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            <span className="me-2">🔄</span>
          )}
          Refresh List
        </button>
      </div>

      {/* Stats Section */}
      <div className="row mb-5">
        <div className="col-md-4">
          <div className="card bg-dark border-secondary rounded-4 shadow-sm p-4 text-center">
            <h5 className="text-white-50 mb-2 text-uppercase font-serif small" style={{ letterSpacing: '1px' }}>
              Total Subscribers
            </h5>
            <div className="display-4 fw-bold text-warning">
              {loadingList ? '...' : subCount}
            </div>
            <p className="text-white-50 small mt-2 mb-0">Active addresses receiving updates</p>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card bg-dark border-secondary rounded-4 shadow-sm p-4 h-100 d-flex flex-column justify-content-center">
            <h5 className="text-warning font-serif mb-2">Campaign Broadcast Guidelines</h5>
            <p className="text-white-50 mb-0 small">
              Sending a broadcast will automatically compile all email addresses in your collection and send the message under BCC (Blind Carbon Copy) configuration. This guarantees that your subscribers' identities remain private and secure.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left: Compose Form */}
        <div className="col-lg-6 mb-5 mb-lg-0">
          <div className="card bg-dark border-secondary rounded-4 shadow-sm p-4 h-100">
            <h3 className="mb-4 font-serif text-warning">Compose Broadcast</h3>
            
            <style>{`
              .newsletter-custom-input {
                background-color: #18181b !important;
                color: #ffffff !important;
                border: 1px solid rgba(245, 158, 11, 0.3) !important;
                border-radius: 8px !important;
                padding: 12px 16px !important;
                transition: all 0.3s ease-in-out !important;
              }
              .newsletter-custom-input::placeholder {
                color: #9ca3af !important;
                opacity: 1 !important;
              }
              .newsletter-custom-input:focus {
                background-color: #18181b !important;
                border-color: #fbbf24 !important;
                box-shadow: 0 0 0 1px #fbbf24 !important;
                outline: none !important;
              }
              .newsletter-custom-label {
                color: #fbbf24 !important;
                font-weight: 600 !important;
              }
            `}</style>
            
            {feedback.text && (
              <div 
                className={`alert ${feedback.type === 'success' ? 'alert-success bg-success bg-opacity-10 text-success border-success' : 'alert-danger bg-danger bg-opacity-10 text-danger border-danger'} rounded-3 p-3 mb-4`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit}>
              <div className="mb-3">
                <label htmlFor="subjectLine" className="form-label newsletter-custom-label">Subject Line</label>
                <input 
                  type="text" 
                  className="form-control newsletter-custom-input" 
                  id="subjectLine"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Celebrate Independence Day at Flavors & Fork!"
                  required
                  disabled={sendingBroadcast}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="broadcastMessage" className="form-label newsletter-custom-label">Message Content (HTML Allowed)</label>
                <textarea 
                  className="form-control newsletter-custom-input" 
                  id="broadcastMessage"
                  name="message"
                  rows="10"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type your message content here..."
                  required
                  disabled={sendingBroadcast}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-warning w-100 rounded-pill py-3 fw-bold text-dark shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={sendingBroadcast || subCount === 0}
              >
                {sendingBroadcast ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Sending Broadcast...
                  </>
                ) : (
                  <>
                    <span>📨</span>
                    Send Broadcast
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Subscribers List */}
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary rounded-4 shadow-sm p-4 h-100">
            <h3 className="mb-4 font-serif text-warning">Subscriber Registry</h3>
            
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {loadingList ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-white-50 mt-3 mb-0">Retrieving subscribers...</p>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-white-50 mb-0">No active subscribers found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover border-secondary align-middle">
                    <thead>
                      <tr className="text-warning">
                        <th scope="col" className="bg-transparent border-secondary">Email Address</th>
                        <th scope="col" className="bg-transparent border-secondary">Subscribed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber._id}>
                          <td className="bg-transparent border-secondary text-light font-monospace">
                            {subscriber.email}
                          </td>
                          <td className="bg-transparent border-secondary text-white-50 small">
                            {new Date(subscriber.createdAt || subscriber.subscribedAt || Date.now()).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
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
    </div>
  );
}

export default AdminNewsletter;
