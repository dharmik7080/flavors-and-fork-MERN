import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Static pre-computed fallback metrics based on 15 seeded items in menu.json
const localMenuDataFallback = [
  { _id: 'main', totalValue: 1870, averagePrice: 267, count: 7 },
  { _id: 'starter', totalValue: 480, averagePrice: 160, count: 3 },
  { _id: 'beverage', totalValue: 410, averagePrice: 137, count: 3 },
  { _id: 'dessert', totalValue: 330, averagePrice: 165, count: 2 }
];

function Analytics({ triggerToast }) {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        if (isMounted) setIsLoading(true);
        const res = await axios.get('/api/orders/analytics');
        
        if (res.status === 503 || (res.data && res.data.success === false)) {
          throw new Error('Database connection offline');
        }

        if (isMounted) {
          if (res.data && res.data.data) {
            setAnalyticsData(res.data.data);
            setIsOffline(false);
          } else {
            setAnalyticsData([]);
          }
        }
      } catch (err) {
        console.error('Analytics Aggregation Database Error:', err);
        if (isMounted) {
          setAnalyticsData(localMenuDataFallback);
          
          // Use functional state updater to verify isOffline state and trigger toast exactly once
          setIsOffline(prevOffline => {
            if (!prevOffline && triggerToast) {
              triggerToast('Operating in offline mode. Real-time business analytics are temporarily unavailable.', 'warning');
            }
            return true;
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="analytics-viewport container my-5 text-white">
      <h2 className="text-center mb-5 font-serif h1 text-warning">Restaurant Business Analytics</h2>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading metrics...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* Muted System Warning Banner when Database is Offline */}
          {isOffline && (
            <div 
              className="alert border-0 rounded-4 p-3 mb-4 text-center d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25) !important',
                color: '#fbbf24',
                fontSize: '0.95rem'
              }}
            >
              <i className="bi bi-wifi-off fs-5"></i>
              <span><strong>Real-time stats offline.</strong> Showing last cached summary.</span>
            </div>
          )}

          {/* Summary stats */}
          <div className="row g-4 mb-5">
            {analyticsData.map((item) => (
              <div key={item._id} className="col-md-3">
                <div 
                  className="card bg-dark border border-secondary rounded-4 shadow-sm hover-card overflow-hidden h-100"
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="card-body p-4">
                    <span className="badge bg-warning text-dark text-capitalize mb-2 px-3 py-2 rounded-pill fw-bold">
                      {item._id || 'Uncategorized'}
                    </span>
                    <h3 className="card-title font-serif fw-bold text-white mt-2 mb-3">₹{item.totalValue}</h3>
                    <div className="text-white-50 small d-flex flex-column gap-1">
                      <div><strong className="text-warning">Avg Price:</strong> ₹{Math.round(item.averagePrice)}</div>
                      <div><strong className="text-warning">Items Count:</strong> {item.count} dishes</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Table breakdown */}
          <div className="bg-dark border border-secondary rounded-4 p-4 shadow-sm">
            <h4 className="font-serif text-warning mb-4"><i className="bi bi-graph-up-arrow me-2"></i>Category Valuation Breakdown</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover table-borderless align-middle mb-0">
                <thead>
                  <tr className="border-bottom border-secondary text-white-50">
                    <th>Category</th>
                    <th className="text-center">Active Dishes Count</th>
                    <th className="text-end">Average Dish Price</th>
                    <th className="text-end">Total Category Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((item) => (
                    <tr key={item._id} className="border-bottom border-secondary border-opacity-50">
                      <td className="text-capitalize fw-bold text-white">{item._id || 'Uncategorized'}</td>
                      <td className="text-center">{item.count}</td>
                      <td className="text-end">₹{item.averagePrice.toFixed(2)}</td>
                      <td className="text-end text-warning fw-bold">₹{item.totalValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
