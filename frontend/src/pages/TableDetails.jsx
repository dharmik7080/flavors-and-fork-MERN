import React from 'react';
import { useParams, Link } from 'react-router-dom';

function TableDetails() {
  const { id } = useParams();

  return (
    <div className="details-container">
      <Link to="/" className="back-link">← Back to Dashboard</Link>
      <div className="details-card">
        <h2>Table #{id} Details</h2>
        <div className="status-indicator reserved">
          <span>Status: Reserved</span>
        </div>
        <p className="details-text">
          Showing configuration, live orders, and booking schedule details for dining table **{id}**.
        </p>
        <div className="info-grid">
          <div className="info-item">
            <strong>Capacity</strong>
            <span>4 Persons</span>
          </div>
          <div className="info-item">
            <strong>Location</strong>
            <span>Main Hall - Window Side</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableDetails;
