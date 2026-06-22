import React from 'react';

function MenuSkeleton() {
  return (
    <div className="row" id="menu-skeleton-grid">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="col-md-4 mb-4">
          <div 
            className="card h-100 border border-secondary bg-dark text-white rounded-4 overflow-hidden shimmer-card" 
            style={{ minHeight: '380px' }}
          >
            {/* Shimmer Image Placeholder */}
            <div className="shimmer-element" style={{ height: '200px' }}></div>
            
            {/* Card Body */}
            <div className="card-body d-flex flex-column gap-2 p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                {/* Shimmer Title Placeholder */}
                <div className="shimmer-element" style={{ height: '24px', width: '60%', borderRadius: '4px' }}></div>
                {/* Shimmer Badge/Price Placeholder */}
                <div className="shimmer-element" style={{ height: '24px', width: '20%', borderRadius: '12px' }}></div>
              </div>
              
              {/* Shimmer Subtext/Description Placeholders */}
              <div className="shimmer-element" style={{ height: '14px', width: '90%', borderRadius: '4px' }}></div>
              <div className="shimmer-element" style={{ height: '14px', width: '80%', borderRadius: '4px' }}></div>
              
              {/* Shimmer Button Placeholder */}
              <div className="mt-auto pt-3">
                <div className="shimmer-element" style={{ height: '38px', width: '100%', borderRadius: '50px' }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MenuSkeleton;
