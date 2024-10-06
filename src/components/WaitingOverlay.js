import React from 'react';

const WaitingOverlay = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="waiting-overlay">
      <div className="waiting-content">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default WaitingOverlay;